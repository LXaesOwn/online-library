import axios from 'axios';
import env from '../config/env';
import { OPEN_LIBRARY } from '../config/constants';
import type { OpenLibrarySearchResponse, OpenLibraryWorkResponse } from '../types';

const headers = { 'User-Agent': 'OnlineLibraryApp/1.0' };

export async function search(
  query: string,
  offset: number,
  limit: number
): Promise<OpenLibrarySearchResponse> {
  const { data } = await axios.get<OpenLibrarySearchResponse>(
    `${env.OPEN_LIBRARY_BASE_URL}/search.json`,
    {
      params: { q: query, offset, limit },
      headers,
      timeout: OPEN_LIBRARY.TIMEOUT_MS,
    }
  );
  return data;
}

export async function getWork(olid: string): Promise<OpenLibraryWorkResponse> {
  const { data } = await axios.get<OpenLibraryWorkResponse>(
    `${env.OPEN_LIBRARY_BASE_URL}/works/${olid}.json`,
    { headers, timeout: OPEN_LIBRARY.TIMEOUT_MS }
  );
  return data;
}
