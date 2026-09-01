/** GitHub Pages 등에서 하위 경로로 열려도 그림이 맞게 붙습니다. */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
