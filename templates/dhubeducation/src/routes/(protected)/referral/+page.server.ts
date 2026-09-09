import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getReferralByEmail, getRefereesByReferralId, createReferral, createReferee, updateReferee, deleteReferee, updateReferral } from '$lib/db/crm';
import { getSettingValue } from '$lib/db/settings';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    throw error(401, 'Unauthorized');
  }

  const referral = await getReferralByEmail(user.email);
  const rewardMin = await getSettingValue('referral_reward_min');
  const rewardMax = await getSettingValue('referral_reward_max');
  
  let referees: any[] = [];
  let bankDetails: any = null;
  if (referral) {
    referees = await getRefereesByReferralId(referral.id);
    // Extract bank details from referral data JSON
    if (referral.data) {
      try {
        const parsed = JSON.parse(referral.data);
        bankDetails = {
          accountName: parsed.accountName || '',
          accountNumber: parsed.accountNumber || '',
          bankName: parsed.bankName || '',
          sortCode: parsed.sortCode || '',
        };
      } catch { /* ignore parse errors */ }
    }
  }

  return {
    referral,
    referees,
    rewardMin: Number(rewardMin) || 100,
    rewardMax: Number(rewardMax) || 500,
    bankDetails,
  };
};

export const actions: Actions = {
  join: async ({ locals }) => {
    const user = locals.user;
    if (!user) throw error(401, 'Unauthorized');

    const existing = await getReferralByEmail(user.email);
    if (existing) return { success: true };

    const result = await createReferral({
      name: user.name,
      email: user.email,
    });

    if (!result) throw error(500, 'Failed to create referral profile');
    return { success: true };
  },

  updateProfile: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) throw error(401, 'Unauthorized');

    const referral = await getReferralByEmail(user.email);
    if (!referral) return fail(400, { message: 'Referral profile not found' });

    const formData = await request.formData();
    const accountName = formData.get('accountName') as string;
    const accountNumber = formData.get('accountNumber') as string;
    const bankName = formData.get('bankName') as string;
    const sortCode = formData.get('sortCode') as string;

    // Merge with existing data
    const existingData = referral.data ? JSON.parse(referral.data) : {};
    const updatedData = {
      ...existingData,
      accountName: accountName?.trim() || '',
      accountNumber: accountNumber?.trim() || '',
      bankName: bankName?.trim() || '',
      sortCode: sortCode?.trim() || '',
    };

    const result = await updateReferral(referral.id, {
      data: JSON.stringify(updatedData),
    });

    if (!result) return fail(500, { message: 'Failed to update profile' });
    return { success: true };
  },

  addReferee: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) throw error(401, 'Unauthorized');

    const referral = await getReferralByEmail(user.email);
    if (!referral) throw error(400, 'Referral profile not found. Please join first.');

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const gender = formData.get('gender') as string;

    if (!name || !email) {
      return fail(400, { message: 'Name and Email are required' });
    }

    const result = await createReferee({
      name,
      email,
      phone,
      gender,
      referralId: referral.id
    });

    if (!result) return fail(500, { message: 'Failed to add referee' });
    return { success: true };
  },

  updateReferee: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) throw error(401, 'Unauthorized');

    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const gender = formData.get('gender') as string;

    if (!id || !name || !email) {
      return fail(400, { message: 'ID, Name and Email are required' });
    }

    const result = await updateReferee(id, {
      name,
      email,
      phone,
      gender
    });

    if (!result) return fail(500, { message: 'Failed to update referee' });
    return { success: true };
  },

  deleteReferee: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) throw error(401, 'Unauthorized');

    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) return fail(400, { message: 'ID is required' });

    const result = await deleteReferee(id);

    if (!result) return fail(500, { message: 'Failed to delete referee' });
    return { success: true };
  }
};
