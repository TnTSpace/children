import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  const response = await fetch(`/api/course/${params.id}`);
  const result = await response.json();

  if (result.status === 'error') {
    throw error(404, result.message || 'Course not found');
  }

  return {
    course: result.data
  };
};
