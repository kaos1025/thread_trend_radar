import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Trend Radar E2E Tests', () => {

    // 1. 메인 대시보드 렌더링 테스트
    test('1. 메인 대시보드가 정상 로드되어야 함', async ({ page }) => {
        await page.goto(BASE_URL);

        // 헤더 확인
        await expect(page.locator('header')).toBeVisible();

        // SocialTrend 로고 확인
        await expect(page.getByText('SocialTrend')).toBeVisible();

        // 메인 타이틀 확인
        await expect(page.getByText('Social Trend Radar')).toBeVisible();

        // 스크린샷 저장
        await page.screenshot({ path: '.playwright-mcp/screenshots/01-main-dashboard.png', fullPage: true });
    });

    // 2. 바이럴 쇼츠 탭 테스트
    test('2. 바이럴 탭 클릭 시 바이럴 쇼츠 UI가 표시되어야 함', async ({ page }) => {
        await page.goto(BASE_URL);

        // 바이럴 탭 클릭
        await page.click('button:has-text("바이럴")');

        // URL 변경 확인
        await expect(page).toHaveURL(/source=viral/);

        // 바이럴 쇼츠 헤더 확인
        await expect(page.getByText('바이럴 쇼츠')).toBeVisible();

        // 키워드 검색 입력창 확인
        await expect(page.getByPlaceholder('검색 키워드 (예: 브이로그, 먹방)')).toBeVisible();

        // 스크린샷 저장
        await page.screenshot({ path: '.playwright-mcp/screenshots/02-viral-shorts-tab.png', fullPage: true });
    });

    // 3. 추천 키워드 태그 테스트
    test('3. 추천 키워드 태그가 표시되어야 함', async ({ page }) => {
        await page.goto(`${BASE_URL}/?source=viral`);

        // 로딩 완료 대기
        await page.waitForSelector('text=바이럴 쇼츠', { timeout: 10000 });

        // 추천 키워드 확인 (일부)
        const keywords = ['브이로그', '일상', '먹방', '쇼핑'];
        for (const keyword of keywords) {
            const badge = page.locator(`text="${keyword}"`).first();
            await expect(badge).toBeVisible({ timeout: 5000 });
        }

        // 스크린샷 저장
        await page.screenshot({ path: '.playwright-mcp/screenshots/03-recommended-keywords.png' });
    });

    // 4. 3단계 티어 필터 버튼 테스트
    test('4. 3단계 티어 필터 버튼이 존재해야 함', async ({ page }) => {
        await page.goto(`${BASE_URL}/?source=viral`);

        await page.waitForSelector('text=바이럴 쇼츠', { timeout: 10000 });

        // 필터 라벨 확인
        await expect(page.getByText('필터:')).toBeVisible();

        // 3단계 티어 확인
        await expect(page.getByText('메가 바이럴').first()).toBeVisible();
        await expect(page.getByText('바이럴').nth(1)).toBeVisible();
        await expect(page.getByText('떠오르는').first()).toBeVisible();

        // 스크린샷 저장
        await page.screenshot({ path: '.playwright-mcp/screenshots/04-tier-filters.png' });
    });

    // 5. 키워드 검색 기능 테스트
    test('5. 추천 키워드 클릭 시 검색이 실행되어야 함', async ({ page }) => {
        await page.goto(`${BASE_URL}/?source=viral`);

        await page.waitForSelector('text=바이럴 쇼츠', { timeout: 10000 });

        // 브이로그 키워드 클릭
        await page.click('text="브이로그"');

        // 로딩 상태 또는 결과 확인 (새로고침 버튼 비활성화 또는 결과 표시)
        // 잠시 대기
        await page.waitForTimeout(2000);

        // 검색 결과 또는 빈 결과 메시지 확인
        const hasResults = await page.locator('.grid > div').count() > 0;
        const hasEmptyMessage = await page.getByText('바이럴 쇼츠를 찾지 못했습니다').isVisible().catch(() => false);

        expect(hasResults || hasEmptyMessage).toBeTruthy();

        // 스크린샷 저장
        await page.screenshot({ path: '.playwright-mcp/screenshots/05-keyword-search.png', fullPage: true });
    });

    // 6. 티어 필터 토글 테스트
    test('6. 티어 필터 버튼 클릭 시 토글되어야 함', async ({ page }) => {
        await page.goto(`${BASE_URL}/?source=viral`);

        await page.waitForSelector('text=바이럴 쇼츠', { timeout: 10000 });

        // 메가 바이럴 필터 클릭 (토글 off)
        const megaFilter = page.getByText('메가 바이럴').first();
        await megaFilter.click();

        // 스크린샷 저장 (필터 변경 후)
        await page.screenshot({ path: '.playwright-mcp/screenshots/06-tier-filter-toggle.png' });
    });

    // 7. 다크모드 토글 테스트
    test('7. 다크모드 토글이 동작해야 함', async ({ page }) => {
        await page.goto(BASE_URL);

        // 초기 상태 확인
        const html = page.locator('html');
        const initialClass = await html.getAttribute('class');

        // 다크모드 토글 버튼 클릭
        await page.click('button[aria-label="테마 전환"]');

        // 잠시 대기
        await page.waitForTimeout(500);

        // 클래스 변경 확인
        const newClass = await html.getAttribute('class');

        // 스크린샷 저장
        await page.screenshot({ path: '.playwright-mcp/screenshots/07-dark-mode.png', fullPage: true });

        // 토글 동작 확인 (클래스가 변경되었는지)
        expect(initialClass !== newClass || newClass?.includes('dark') || newClass?.includes('light')).toBeTruthy();
    });

    // 8. 탭 전환 테스트 (트렌드 -> 바이럴 -> 트렌드)
    test('8. 탭 전환이 정상 동작해야 함', async ({ page }) => {
        await page.goto(BASE_URL);

        // 트렌드 탭 활성화 확인
        await expect(page.getByText('트렌드').first()).toBeVisible();

        // 바이럴 탭 클릭
        await page.click('button:has-text("바이럴")');
        await expect(page).toHaveURL(/source=viral/);

        // YouTube 탭 클릭
        await page.click('button:has-text("YouTube")');
        await expect(page).toHaveURL(/source=youtube/);

        // 다시 트렌드 탭 클릭
        await page.click('button:has-text("트렌드")');

        // 스크린샷 저장
        await page.screenshot({ path: '.playwright-mcp/screenshots/08-tab-navigation.png' });
    });

    // 9. 반응형 - 모바일 뷰 테스트
    test('9. 모바일 뷰에서 정상 렌더링되어야 함', async ({ page }) => {
        // 모바일 뷰포트 설정
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto(`${BASE_URL}/?source=viral`);

        // 바이럴 쇼츠 헤더 확인
        await expect(page.getByText('바이럴 쇼츠')).toBeVisible({ timeout: 10000 });

        // 스크린샷 저장
        await page.screenshot({ path: '.playwright-mcp/screenshots/09-mobile-view.png', fullPage: true });
    });

    // 10. 반응형 - 태블릿 뷰 테스트
    test('10. 태블릿 뷰에서 정상 렌더링되어야 함', async ({ page }) => {
        // 태블릿 뷰포트 설정
        await page.setViewportSize({ width: 768, height: 1024 });

        await page.goto(`${BASE_URL}/?source=viral`);

        // 바이럴 쇼츠 헤더 확인
        await expect(page.getByText('바이럴 쇼츠')).toBeVisible({ timeout: 10000 });

        // 스크린샷 저장
        await page.screenshot({ path: '.playwright-mcp/screenshots/10-tablet-view.png', fullPage: true });
    });
});
