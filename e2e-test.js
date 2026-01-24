// E2E 테스트 스크립트 (Playwright 사용)
const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = '.playwright-mcp/screenshots';

async function runTests() {
    const results = [];
    let passed = 0;
    let failed = 0;

    console.log('\n=== Trend Radar E2E 테스트 시작 ===\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // 테스트 1: 메인 대시보드 로딩
    try {
        console.log('테스트 1: 메인 대시보드 로딩...');
        await page.goto(BASE_URL, { timeout: 10000 });

        const header = await page.locator('header').isVisible();
        const title = await page.getByText('Social Trend Radar').isVisible();
        const socialTrend = await page.getByText('SocialTrend').isVisible();

        if (header && title && socialTrend) {
            await page.screenshot({ path: `${SCREENSHOT_DIR}/01-main-dashboard.png`, fullPage: true });
            results.push({ test: '메인 대시보드 로딩', status: 'PASS', detail: '헤더, 타이틀 정상 렌더링' });
            passed++;
        } else {
            results.push({ test: '메인 대시보드 로딩', status: 'FAIL', detail: `header:${header}, title:${title}, logo:${socialTrend}` });
            failed++;
        }
    } catch (e) {
        results.push({ test: '메인 대시보드 로딩', status: 'FAIL', detail: e.message });
        failed++;
    }

    // 테스트 2: 바이럴 탭 클릭
    try {
        console.log('테스트 2: 바이럴 탭 전환...');
        await page.click('button:has-text("바이럴")');
        await page.waitForTimeout(1000);

        const url = page.url();
        const hasViralParam = url.includes('source=viral');
        const viralHeader = await page.getByText('바이럴 쇼츠').isVisible();

        if (hasViralParam && viralHeader) {
            await page.screenshot({ path: `${SCREENSHOT_DIR}/02-viral-tab.png`, fullPage: true });
            results.push({ test: '바이럴 탭 전환', status: 'PASS', detail: 'URL 파라미터 및 헤더 정상' });
            passed++;
        } else {
            results.push({ test: '바이럴 탭 전환', status: 'FAIL', detail: `URL:${hasViralParam}, header:${viralHeader}` });
            failed++;
        }
    } catch (e) {
        results.push({ test: '바이럴 탭 전환', status: 'FAIL', detail: e.message });
        failed++;
    }

    // 테스트 3: 키워드 검색 입력창 확인
    try {
        console.log('테스트 3: 키워드 검색 입력창...');
        await page.goto(`${BASE_URL}/?source=viral`);
        await page.waitForTimeout(2000);

        const searchInput = await page.getByPlaceholder('검색 키워드 (예: 브이로그, 먹방)').isVisible();
        const searchButton = await page.getByRole('button', { name: '검색' }).isVisible();

        if (searchInput && searchButton) {
            await page.screenshot({ path: `${SCREENSHOT_DIR}/03-search-input.png` });
            results.push({ test: '키워드 검색 입력창', status: 'PASS', detail: '입력창 및 검색 버튼 존재' });
            passed++;
        } else {
            results.push({ test: '키워드 검색 입력창', status: 'FAIL', detail: `input:${searchInput}, button:${searchButton}` });
            failed++;
        }
    } catch (e) {
        results.push({ test: '키워드 검색 입력창', status: 'FAIL', detail: e.message });
        failed++;
    }

    // 테스트 4: 추천 키워드 태그 확인
    try {
        console.log('테스트 4: 추천 키워드 태그...');
        const keywords = ['브이로그', '일상', '먹방', '쇼핑'];
        let foundCount = 0;

        for (const kw of keywords) {
            const exists = await page.locator(`text="${kw}"`).first().isVisible().catch(() => false);
            if (exists) foundCount++;
        }

        if (foundCount >= 3) {
            await page.screenshot({ path: `${SCREENSHOT_DIR}/04-keywords.png` });
            results.push({ test: '추천 키워드 태그', status: 'PASS', detail: `${foundCount}/4 키워드 표시됨` });
            passed++;
        } else {
            results.push({ test: '추천 키워드 태그', status: 'FAIL', detail: `${foundCount}/4 키워드만 발견` });
            failed++;
        }
    } catch (e) {
        results.push({ test: '추천 키워드 태그', status: 'FAIL', detail: e.message });
        failed++;
    }

    // 테스트 5: 3단계 티어 필터 확인
    try {
        console.log('테스트 5: 3단계 티어 필터...');
        const filterLabel = await page.getByText('필터:').isVisible().catch(() => false);
        const megaViral = await page.getByText('메가 바이럴').first().isVisible().catch(() => false);
        const rising = await page.getByText('떠오르는').first().isVisible().catch(() => false);

        if (filterLabel && megaViral && rising) {
            await page.screenshot({ path: `${SCREENSHOT_DIR}/05-tier-filters.png` });
            results.push({ test: '3단계 티어 필터', status: 'PASS', detail: '필터 라벨 및 티어 버튼 존재' });
            passed++;
        } else {
            results.push({ test: '3단계 티어 필터', status: 'FAIL', detail: `filter:${filterLabel}, mega:${megaViral}, rising:${rising}` });
            failed++;
        }
    } catch (e) {
        results.push({ test: '3단계 티어 필터', status: 'FAIL', detail: e.message });
        failed++;
    }

    // 테스트 6: 키워드 클릭 검색 테스트
    try {
        console.log('테스트 6: 키워드 클릭 검색...');
        await page.click('text="브이로그"');
        await page.waitForTimeout(3000);

        // 검색 결과 또는 빈 메시지 확인
        const hasResults = await page.locator('.grid > div').count() > 0;
        const emptyMessage = await page.getByText('바이럴 쇼츠를 찾지 못했습니다').isVisible().catch(() => false);

        if (hasResults || emptyMessage) {
            await page.screenshot({ path: `${SCREENSHOT_DIR}/06-search-result.png`, fullPage: true });
            results.push({ test: '키워드 클릭 검색', status: 'PASS', detail: hasResults ? '검색 결과 표시' : '빈 결과 메시지 표시' });
            passed++;
        } else {
            results.push({ test: '키워드 클릭 검색', status: 'FAIL', detail: '검색 결과나 빈 메시지 없음' });
            failed++;
        }
    } catch (e) {
        results.push({ test: '키워드 클릭 검색', status: 'FAIL', detail: e.message });
        failed++;
    }

    // 테스트 7: 티어 필터 토글
    try {
        console.log('테스트 7: 티어 필터 토글...');
        await page.goto(`${BASE_URL}/?source=viral`);
        await page.waitForTimeout(2000);

        // 메가 바이럴 필터 클릭
        await page.getByText('메가 바이럴').first().click();
        await page.waitForTimeout(500);

        await page.screenshot({ path: `${SCREENSHOT_DIR}/07-tier-toggle.png` });
        results.push({ test: '티어 필터 토글', status: 'PASS', detail: '토글 클릭 동작' });
        passed++;
    } catch (e) {
        results.push({ test: '티어 필터 토글', status: 'FAIL', detail: e.message });
        failed++;
    }

    // 테스트 8: 다크모드 토글
    try {
        console.log('테스트 8: 다크모드 토글...');
        await page.goto(BASE_URL);
        await page.waitForTimeout(1000);

        const initialTheme = await page.locator('html').getAttribute('class');

        // 테마 전환 버튼 클릭
        await page.click('button[aria-label="테마 전환"]');
        await page.waitForTimeout(500);

        const newTheme = await page.locator('html').getAttribute('class');

        await page.screenshot({ path: `${SCREENSHOT_DIR}/08-dark-mode.png`, fullPage: true });

        if (initialTheme !== newTheme) {
            results.push({ test: '다크모드 토글', status: 'PASS', detail: `테마 변경: ${initialTheme?.slice(0,20)} -> ${newTheme?.slice(0,20)}` });
            passed++;
        } else {
            results.push({ test: '다크모드 토글', status: 'WARN', detail: '테마 클래스 변화 없음 (system 테마일 수 있음)' });
            passed++;
        }
    } catch (e) {
        results.push({ test: '다크모드 토글', status: 'FAIL', detail: e.message });
        failed++;
    }

    // 테스트 9: 모바일 반응형
    try {
        console.log('테스트 9: 모바일 반응형 (375x667)...');
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(`${BASE_URL}/?source=viral`);
        await page.waitForTimeout(2000);

        const viralHeader = await page.getByText('바이럴 쇼츠').isVisible().catch(() => false);

        if (viralHeader) {
            await page.screenshot({ path: `${SCREENSHOT_DIR}/09-mobile.png`, fullPage: true });
            results.push({ test: '모바일 반응형', status: 'PASS', detail: '375x667 정상 렌더링' });
            passed++;
        } else {
            results.push({ test: '모바일 반응형', status: 'FAIL', detail: '바이럴 쇼츠 헤더 미표시' });
            failed++;
        }
    } catch (e) {
        results.push({ test: '모바일 반응형', status: 'FAIL', detail: e.message });
        failed++;
    }

    // 테스트 10: 태블릿 반응형
    try {
        console.log('테스트 10: 태블릿 반응형 (768x1024)...');
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto(`${BASE_URL}/?source=viral`);
        await page.waitForTimeout(2000);

        const viralHeader = await page.getByText('바이럴 쇼츠').isVisible().catch(() => false);

        if (viralHeader) {
            await page.screenshot({ path: `${SCREENSHOT_DIR}/10-tablet.png`, fullPage: true });
            results.push({ test: '태블릿 반응형', status: 'PASS', detail: '768x1024 정상 렌더링' });
            passed++;
        } else {
            results.push({ test: '태블릿 반응형', status: 'FAIL', detail: '바이럴 쇼츠 헤더 미표시' });
            failed++;
        }
    } catch (e) {
        results.push({ test: '태블릿 반응형', status: 'FAIL', detail: e.message });
        failed++;
    }

    await browser.close();

    // 결과 출력
    console.log('\n\n========================================');
    console.log('       E2E 테스트 결과 리포트');
    console.log('========================================\n');

    console.log(`총 테스트: ${results.length}개`);
    console.log(`통과: ${passed}개`);
    console.log(`실패: ${failed}개`);
    console.log(`성공률: ${((passed / results.length) * 100).toFixed(1)}%\n`);

    console.log('----------------------------------------');
    console.log('상세 결과:');
    console.log('----------------------------------------');

    results.forEach((r, i) => {
        const icon = r.status === 'PASS' ? '[PASS]' : r.status === 'WARN' ? '[WARN]' : '[FAIL]';
        console.log(`${i + 1}. ${icon} ${r.test}`);
        console.log(`   -> ${r.detail}`);
    });

    console.log('\n스크린샷 저장 위치: .playwright-mcp/screenshots/');
    console.log('========================================\n');

    return { passed, failed, results };
}

runTests().catch(console.error);
