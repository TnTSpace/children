import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }: { fetch: any; params: any }) => {
  const response = await fetch(`/api/review/${params.id}`);
  const result = await response.json();

  if (result.status === 'error') {
    throw error(404, result.message || 'Review not found');
  }

  return {
    review: result.data
  };
};
