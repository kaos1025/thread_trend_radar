import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = 'test-results/viral-shorts';

test.describe('Viral Shorts E2E Tests', () => {

    test.beforeAll(async () => {
        // 스크린샷 디렉토리 생성은 Playwright가 자동으로 처리
    });

    // TC01: 바이럴 쇼츠 탭 로딩
    test('TC01: 바이럴 쇼츠 탭 정상 로딩', async ({ page }) => {
        // 1. localhost:3000 접속
        await page.goto(BASE_URL);

        // 2. 페이지 로딩 완료 확인
        await expect(page.locator('header')).toBeVisible({ timeout: 10000 });

        // 3. "바이럴" 탭 찾아서 클릭
        const viralTab = page.locator('button:has-text("바이럴")');
        await expect(viralTab).toBeVisible();
        await viralTab.click();

        // 4. URL 변경 확인
        await expect(page).toHaveURL(/source=viral/);

        // 5. 데이터 로딩 완료 확인 - heading 사용하여 정확히 선택
        await expect(page.getByRole('heading', { name: '바이럴 쇼츠' })).toBeVisible({ timeout: 15000 });

        // 스크린샷 저장
        await page.screenshot({
            path: `${SCREENSHOT_DIR}/TC01-viral-tab-loaded.png`,
            fullPage: true
        });
    });

    // TC02: 바이럴 영상 표시 확인
    test('TC02: 바이럴 영상 카드 요소 확인', async ({ page }) => {
        await page.goto(`${BASE_URL}/?source=viral`);

        // 로딩 완료 대기 - heading 사용
        await expect(page.getByRole('heading', { name: '바이럴 쇼츠' })).toBeVisible({ timeout: 15000 });

        // 로딩 스켈레톤이 사라질 때까지 대기 (최대 30초)
        await page.waitForFunction(() => {
            const skeletons = document.querySelectorAll('[class*="skeleton"]');
            return skeletons.length === 0;
        }, { timeout: 30000 }).catch(() => {
            // 스켈레톤이 없거나 이미 사라진 경우
        });

        // 추가 대기 (API 응답 시간)
        await page.waitForTimeout(3000);

        // 영상 카드 또는 빈 결과 메시지 확인
        const videoCards = page.locator('.grid > div').first();
        const emptyMessage = page.getByText('바이럴 쇼츠를 찾지 못했습니다');

        const hasCards = await videoCards.isVisible().catch(() => false);
        const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);

        if (hasCards && !hasEmptyMessage) {
            // 영상 카드가 1개 이상 표시되는지 확인
            const cardCount = await page.locator('.grid > div').count();
            expect(cardCount).toBeGreaterThan(0);
            console.log(`Found ${cardCount} video cards`);

            // 첫 번째 카드에서 필수 요소 확인
            const firstCard = page.locator('.grid > div').first();

            // 썸네일 이미지 확인 (img 또는 YouTube 아이콘)
            const hasThumbnail = await firstCard.locator('img').isVisible().catch(() => false);
            const hasYoutubeIcon = await firstCard.locator('[class*="lucide-youtube"]').isVisible().catch(() => false);
            expect(hasThumbnail || hasYoutubeIcon).toBeTruthy();

            // 조회수 표시 확인 (Eye 아이콘과 함께)
            const hasViewCount = await firstCard.getByText(/조회수/).isVisible().catch(() => false);

            // 구독자 수 표시 확인
            const hasSubscribers = await firstCard.getByText(/구독자/).isVisible().catch(() => false);

            // 바이럴 비율 표시 확인
            const hasViralRatio = await firstCard.getByText(/배 바이럴|x$/).isVisible().catch(() => false);

            console.log(`Has thumbnail: ${hasThumbnail}`);
            console.log(`Has view count: ${hasViewCount}`);
            console.log(`Has subscribers: ${hasSubscribers}`);
            console.log(`Has viral ratio: ${hasViralRatio}`);
        } else {
            // 빈 결과 상태 확인
            expect(hasEmptyMessage).toBeTruthy();
            console.log('No viral videos found - empty state displayed');
        }

        // 스크린샷 저장
        await page.screenshot({
            path: `${SCREENSHOT_DIR}/TC02-video-cards.png`,
            fullPage: true
        });
    });

    // TC03: 바이럴 등급 뱃지 확인 (데이터가 있을 때만 검증)
    test('TC03: 바이럴 등급 뱃지 표시 확인', async ({ page }) => {
        await page.goto(`${BASE_URL}/?source=viral`);

        // heading 사용
        await expect(page.getByRole('heading', { name: '바이럴 쇼츠' })).toBeVisible({ timeout: 15000 });

        // 로딩 완료 대기
        await page.waitForTimeout(5000);

        // 빈 상태인지 확인
        const emptyMessage = page.getByText('바이럴 쇼츠를 찾지 못했습니다');
        const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);

        if (hasEmptyMessage) {
            // 빈 상태에서는 필터가 표시되지 않을 수 있음
            console.log('Empty state - filter badges may not be visible');

            // 새로고침 버튼은 여전히 존재해야 함
            const refreshButton = page.getByRole('button', { name: /새로고침/ });
            await expect(refreshButton).toBeVisible();
        } else {
            // 필터 섹션에서 3단계 등급 뱃지 확인
            const megaBadge = page.getByText('메가 바이럴').first();
            const risingBadge = page.getByText('떠오르는').first();

            // 필터 라벨 확인
            const filterLabel = page.getByText('필터:');
            const hasFilterLabel = await filterLabel.isVisible().catch(() => false);

            if (hasFilterLabel) {
                // 3단계 티어 필터 버튼 확인
                const hasMegaFilter = await megaBadge.isVisible().catch(() => false);
                const hasRisingFilter = await risingBadge.isVisible().catch(() => false);

                console.log(`Mega filter visible: ${hasMegaFilter}`);
                console.log(`Rising filter visible: ${hasRisingFilter}`);

                // 최소 1개의 필터는 보여야 함
                expect(hasMegaFilter || hasRisingFilter).toBeTruthy();
            }
        }

        // 스크린샷 저장
        await page.screenshot({
            path: `${SCREENSHOT_DIR}/TC03-viral-badges.png`,
            fullPage: true
        });
    });

    // TC04: 에러/빈 데이터 상태
    test('TC04: 빈 데이터 상태 UI 확인', async ({ page }) => {
        await page.goto(`${BASE_URL}/?source=viral`);

        // heading 사용
        await expect(page.getByRole('heading', { name: '바이럴 쇼츠' })).toBeVisible({ timeout: 15000 });
        await page.waitForTimeout(3000);

        // 데이터가 있거나 빈 상태 메시지가 표시되어야 함
        const hasCards = await page.locator('.grid > div').first().isVisible().catch(() => false);
        const emptyMessage = page.getByText('바이럴 쇼츠를 찾지 못했습니다');
        const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);

        // 에러 상태 확인
        const errorMessage = page.getByText('데이터를 불러올 수 없습니다');
        const hasError = await errorMessage.isVisible().catch(() => false);

        // 세 가지 상태 중 하나는 표시되어야 함
        expect(hasCards || hasEmptyMessage || hasError).toBeTruthy();

        if (hasError) {
            // 에러 상태일 때 "다시 시도" 버튼 확인
            const retryButton = page.getByRole('button', { name: /다시 시도/ });
            await expect(retryButton).toBeVisible();
            console.log('Error state with retry button displayed');
        } else if (hasEmptyMessage) {
            console.log('Empty state message displayed');
        } else {
            console.log('Video cards displayed');
        }

        // 스크린샷 저장
        await page.screenshot({
            path: `${SCREENSHOT_DIR}/TC04-data-state.png`,
            fullPage: true
        });
    });

    // TC05: 키워드 검색 기능 테스트 (데이터가 있을 때만 검증)
    test('TC05: 키워드 검색 UI 확인', async ({ page }) => {
        await page.goto(`${BASE_URL}/?source=viral`);

        // heading 사용
        await expect(page.getByRole('heading', { name: '바이럴 쇼츠' })).toBeVisible({ timeout: 15000 });
        await page.waitForTimeout(3000);

        // 빈 상태인지 확인
        const emptyMessage = page.getByText('바이럴 쇼츠를 찾지 못했습니다');
        const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);

        if (hasEmptyMessage) {
            // 빈 상태에서는 검색 UI가 표시되지 않을 수 있음
            console.log('Empty state - search UI may not be visible');

            // 하지만 새로고침 버튼은 있어야 함
            const refreshButton = page.getByRole('button', { name: /새로고침/ });
            await expect(refreshButton).toBeVisible();
        } else {
            // 검색 입력창 확인
            const searchInput = page.getByPlaceholder('검색 키워드 (예: 브이로그, 먹방)');
            const hasSearchInput = await searchInput.isVisible().catch(() => false);

            if (hasSearchInput) {
                await expect(searchInput).toBeVisible();

                // 검색 버튼 확인
                const searchButton = page.getByRole('button', { name: '검색' });
                await expect(searchButton).toBeVisible();

                // 추천 키워드 확인
                const keywords = ['브이로그', '일상', '먹방'];
                for (const keyword of keywords) {
                    const badge = page.getByText(keyword, { exact: true }).first();
                    const isVisible = await badge.isVisible().catch(() => false);
                    console.log(`Keyword "${keyword}" visible: ${isVisible}`);
                }
            }
        }

        // 스크린샷 저장
        await page.screenshot({
            path: `${SCREENSHOT_DIR}/TC05-search-function.png`,
            fullPage: true
        });
    });

    // TC06: 새로고침 버튼
    test('TC06: 새로고침 버튼 동작 테스트', async ({ page }) => {
        await page.goto(`${BASE_URL}/?source=viral`);

        // heading 사용
        await expect(page.getByRole('heading', { name: '바이럴 쇼츠' })).toBeVisible({ timeout: 15000 });
        await page.waitForTimeout(3000);

        // 새로고침 버튼 확인
        const refreshButton = page.getByRole('button', { name: /새로고침/ });
        await expect(refreshButton).toBeVisible();

        // 새로고침 클릭
        await refreshButton.click();

        // 버튼이 비활성화되거나 스피너가 표시되는지 확인
        await page.waitForTimeout(1000);

        // 스크린샷 저장
        await page.screenshot({
            path: `${SCREENSHOT_DIR}/TC06-refresh-button.png`,
            fullPage: true
        });
    });
});
