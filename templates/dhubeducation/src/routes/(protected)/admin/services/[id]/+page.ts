import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  const response = await fetch(`/api/service/${params.id}`);
  const result = await response.json();

  if (result.status === 'error') {
    throw error(404, result.message || 'Service not found');
  }

  return {
    service: result.data
  };
};
