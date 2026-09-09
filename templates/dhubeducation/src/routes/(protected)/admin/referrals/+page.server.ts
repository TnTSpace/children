import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { 
  getReferralsBySearchFilter, 
  getRefereesBySearchFilter, 
  updateReferee,
  deleteReferee,
  deleteReferral,
  getReferee
} from '$lib/db/crm';
import { getSettingValue, setSettingValue } from '$lib/db/settings';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.user?.role !== 'admin' && locals.user?.role !== 'editor') {
    throw error(403, 'Forbidden');
  }

  const referralPage = Number(url.searchParams.get('rpage')) || 1;
  const refereePage = Number(url.searchParams.get('refpage')) || 1;
  const rSearch = url.searchParams.get('rsearch') || '';
  const refSearch = url.searchParams.get('refsearch') || '';

  const referrals = await getReferralsBySearchFilter({ 
    search: rSearch, 
    offset: String((referralPage - 1) * 20) 
  });
  const referees = await getRefereesBySearchFilter({ 
    search: refSearch, 
    offset: String((refereePage - 1) * 20) 
  });

  const rewardMin = await getSettingValue('referral_reward_min');
  const rewardMax = await getSettingValue('referral_reward_max');

  return {
    referrals: referrals.data,
    referees: referees.data,
    rewardMin: Number(rewardMin) || 100,
    rewardMax: Number(rewardMax) || 500,
  };
};

export const actions: Actions = {
  updateRewardAmount: async ({ request, locals }) => {
    if (locals.user?.role !== 'admin') throw error(403, 'Forbidden');
    
    const formData = await request.formData();
    const minAmount = Number(formData.get('minAmount') as string);
    const maxAmount = Number(formData.get('maxAmount') as string);
    
    if (isNaN(minAmount) || minAmount <= 0 || isNaN(maxAmount) || maxAmount <= 0) {
      return { success: false, message: 'Invalid amount' };
    }
    if (minAmount > maxAmount) {
      return { success: false, message: 'Minimum must be less than or equal to maximum' };
    }

    const minResult = await setSettingValue('referral_reward_min', String(minAmount));
    const maxResult = await setSettingValue('referral_reward_max', String(maxAmount));
    if (!minResult || !maxResult) return { success: false, message: 'Failed to update reward range' };
    return { success: true };
  },

  updateRefereeStatus: async ({ request, locals }) => {
    if (locals.user?.role !== 'admin' && locals.user?.role !== 'editor') throw error(403, 'Forbidden');

    const formData = await request.formData();
    const id = formData.get('id') as string;
    const status = formData.get('status') as string;

    // Preserve existing data and merge status
    const existing = await getReferee(id);
    const existingData = existing?.data ? JSON.parse(existing.data) : {};
    const updatedData = { ...existingData, status };

    // Clear payment info if revoking admission
    if (status !== 'admitted') {
      delete updatedData.paymentStatus;
      delete updatedData.rewardAmount;
      delete updatedData.paidAt;
      delete updatedData.receiptFileId;
      delete updatedData.receiptUrl;
    }

    const result = await updateReferee(id, {
      data: JSON.stringify(updatedData)
    });

    if (!result) return { success: false, message: 'Failed to update status' };
    return { success: true };
  },

  deleteReferee: async ({ request, locals }) => {
    if (locals.user?.role !== 'admin') throw error(403, 'Forbidden');
    const formData = await request.formData();
    const id = formData.get('id') as string;
    await deleteReferee(id);
    return { success: true };
  },

  deleteReferral: async ({ request, locals }) => {
    if (locals.user?.role !== 'admin') throw error(403, 'Forbidden');
    const formData = await request.formData();
    const id = formData.get('id') as string;
    await deleteReferral(id);
    return { success: true };
  }
};
