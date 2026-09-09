import { browser } from '$app/environment';
import { MAX_ITEMS_PER_PAGE } from '$lib/constants';
import type { iFetchMeta } from '$lib/interface';
import { writable } from 'svelte/store';
import { createInfiniteQuery, QueryClient, type CreateInfiniteQueryResult, type InfiniteData } from '@tanstack/svelte-query';

export class InfiniteScroll {
  private static instance: InfiniteScroll;
  #queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser
      }
    }
  });

  public static getInstance(): InfiniteScroll {
    if (!InfiniteScroll.instance) {
      InfiniteScroll.instance = new InfiniteScroll();
    }
    return InfiniteScroll.instance;
  }

  static async fetchList(endpoint: string, offset: number = 0, search: string = '', params?: Record<string, string>) {
    const baseUrl = browser ? window.location.origin : 'http://localhost:5173';
    const url = new URL(endpoint, baseUrl);
    url.searchParams.set("search", search);
    url.searchParams.set("offset", offset.toString());

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value);
        }
      });
    }

    const response = await fetch(url);
    const partial = await response.json() as iFetchMeta;
    return { ...partial, lastIndex: offset * MAX_ITEMS_PER_PAGE } as iFetchMeta;
  }

  async queryEndpoint(offset: number = 1, host: string = '', field: string = '', search: string = '', params?: Record<string, string>) {
    const endpoint = `${host}/api/${field}`;
    return await InfiniteScroll.fetchList(endpoint, offset, search, params);
  }

  listQuery<T>(paramsGetter: () => Record<string, any>, host: string = '', field: string = ''): CreateInfiniteQueryResult<{ results: T[]; total: number }> {
    const self = this;

    const buildOptions = (p: Record<string, any>) => {
      const { search, ...rest } = p;
      return {
        queryKey: ['infinite-scroll', field, search || '', ...Object.values(rest).sort()],
        staleTime: 30000,
        initialPageParam: 1,
        retry: false,
        queryFn: async ({ pageParam }: { pageParam: number }) => {
          const params = paramsGetter();
          const offset = (pageParam - 1) * MAX_ITEMS_PER_PAGE;
          const search = params.search || '';
          const metalist = await self.queryEndpoint(offset, host, field, search, params);

          return {
            results: (metalist.data || []) as T[],
            hasMore: metalist.meta?.more || false,
            pageParam,
            total: metalist.total || 0,
          };
        },
        getNextPageParam: (lastPage: any) => lastPage.hasMore ? lastPage.pageParam + 1 : undefined,
        select: (data: any) => {
          let total = 0;
          const results = data.pages.flatMap((page: any) => {
            total = page.total;
            return page.results;
          });
          return { results, total };
        },
      };
    };

    const initialParams = paramsGetter();
    const optionsStore = writable(buildOptions(initialParams));

    $effect(() => {
      const p = paramsGetter();
      optionsStore.set(buildOptions(p));
    });

    return createInfiniteQuery(optionsStore, this.#queryClient) as any;
  }

  listQueryAlternate<T>(paramsGetter: () => Record<string, any>): CreateInfiniteQueryResult<{ results: T[]; total: number }> {
    const self = this;

    const buildOptions = (p: Record<string, any>) => {
      const { search, field, host, ...rest } = p;
      return {
        queryKey: ['infinite-scroll-alt', field, search || '', ...Object.values(rest).sort()],
        staleTime: 30000,
        initialPageParam: 1,
        retry: false,
        queryFn: async ({ pageParam }: { pageParam: number }) => {
          const params = paramsGetter();
          const offset = (pageParam - 1) * MAX_ITEMS_PER_PAGE;
          const search = params.search || '';
          const field = params.field || '';
          const host = params.host || '';
          const metalist = await self.queryEndpoint(offset, host, field, search, params);

          return {
            results: (metalist.data || []) as T[],
            hasMore: metalist.meta?.more || false,
            pageParam,
            total: metalist.total || 0,
          };
        },
        getNextPageParam: (lastPage: any) => lastPage.hasMore ? lastPage.pageParam + 1 : undefined,
        select: (data: any) => {
          let total = 0;
          const results = data.pages.flatMap((page: any) => {
            total = page.total;
            return page.results;
          });
          return { results, total };
        },
      };
    };

    const initialParams = paramsGetter();
    const optionsStore = writable(buildOptions(initialParams));

    $effect(() => {
      const p = paramsGetter();
      optionsStore.set(buildOptions(p));
    });

    return createInfiniteQuery(optionsStore, this.#queryClient) as any;
  }

  get queryClient() {
    return this.#queryClient;
  }
}

export const infiniteScroll = InfiniteScroll.getInstance();

export function useInfiniteScroll({
  onLoadMore,
  disabled,
}: {
  onLoadMore: () => void;
  disabled: () => boolean;
}) {
  function sentinel(node: HTMLElement) {
    let observer: IntersectionObserver;

    if (browser) {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !disabled()) {
          onLoadMore();
        }
      });

      observer.observe(node);
    }

    return {
      destroy() {
        if (observer) observer.disconnect();
      },
    };
  }

  return { sentinel };
}
