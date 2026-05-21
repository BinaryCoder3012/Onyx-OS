import { NextResponse } from 'next/server';

/**
 * API endpoint to construct competitive‑programming platform URLs based on user handles.
 * Query parameters:
 *   - codeforces
 *   - codechef
 *   - leetcode
 *   - atcoder
 * Returns a JSON object with the final URLs (or null if handle missing).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cf = searchParams.get('codeforces');
  const cc = searchParams.get('codechef');
  const lc = searchParams.get('leetcode');
  const ac = searchParams.get('atcoder');

  const links = {
    codeforces: cf ? `https://codeforces.com/profile/${cf}` : null,
    codechef: cc ? `https://www.codechef.com/users/${cc}` : null,
    leetcode: lc ? `https://leetcode.com/${lc}` : null,
    atcoder: ac ? `https://atcoder.jp/users/${ac}` : null,
  };

  return NextResponse.json(links);
}
