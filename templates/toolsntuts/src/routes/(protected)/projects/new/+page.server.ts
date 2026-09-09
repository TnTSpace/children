import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createProject, persistBreakdown, updateProjectStatus, getOrCreateWallet } from '$lib/db/media-queries';
import { scriptBreakdown } from '$lib/server/windmill';
import { pipelineError } from '$lib/server/errors';
import type { ProjectFormat } from '$lib/db/media';
import { ASPECT_RATIOS } from '$lib/constants/media';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(302, '/auth/login?redirectTo=/projects/new');
  if (locals.user.role !== 'admin' && locals.user.role !== 'superadmin') throw redirect(302, '/dashboard');
  const wallet = await getOrCreateWallet(locals.user.id);
  return { wallet };
};

const VALID_FORMATS: ProjectFormat[] = ['narrated_short', 'cinematic', 'music_video', 'ad'];

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) throw redirect(302, '/auth/login');
    if (locals.user.role !== 'admin' && locals.user.role !== 'superadmin') throw redirect(302, '/dashboard');
    const form = await request.formData();

    const title = String(form.get('title') ?? '').trim();
    const brief = String(form.get('brief') ?? '').trim();
    const format = String(form.get('format') ?? 'narrated_short') as ProjectFormat;
    const aspectRatio = String(form.get('aspectRatio') ?? '16:9');
    const targetDurationSec = parseInt(String(form.get('targetDurationSec') ?? '45'), 10) || 45;

    const values = { title, brief, format, aspectRatio, targetDurationSec };

    if (brief.length < 10) return fail(400, { ...values, error: 'Please describe your idea in a bit more detail.' });
    if (!VALID_FORMATS.includes(format)) return fail(400, { ...values, error: 'Invalid format.' });
    if (!ASPECT_RATIOS.includes(aspectRatio as never)) return fail(400, { ...values, error: 'Invalid aspect ratio.' });

    const proj = await createProject({
      userId: locals.user.id,
      title: title || 'Untitled project',
      brief,
      format,
      aspectRatio,
      targetDurationSec
    });

    try {
      const result = await scriptBreakdown({ brief, format, targetDurationSec, aspectRatio });
      if (!result.success || !result.breakdown) {
        await updateProjectStatus(proj.id, 'draft');
        const { status, message } = pipelineError(result.error, locals.user, 'script_breakdown');
        return fail(status, { ...values, error: message });
      }
      await persistBreakdown(proj.id, result.breakdown);
    } catch (e) {
      await updateProjectStatus(proj.id, 'draft');
      const { status, message } = pipelineError(e, locals.user, 'script_breakdown');
      return fail(status, { ...values, error: message });
    }

    throw redirect(303, `/projects/${proj.id}`);
  }
};
