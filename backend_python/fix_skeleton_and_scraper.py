import re

# 1. Fix Skeleton
with open("src/features/ranking/ui/RealtimeRankTable.tsx", "r", encoding="utf-8") as f:
    table_content = f.read()

skeleton_target = '''        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 h-32 flex gap-4">'''

skeleton_replacement = '''        {isLoading ? (
          <div className="flex flex-col gap-3 p-5 sm:p-6 bg-slate-50/50 dark:bg-white/[0.01]">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 h-24 flex gap-4">'''

table_content = table_content.replace(skeleton_target, skeleton_replacement)

with open("src/features/ranking/ui/RealtimeRankTable.tsx", "w", encoding="utf-8") as f:
    f.write(table_content)


# 2. Fix Scraper Timeout / Optimization
with open("domains/scraping/full_list_extractor.py", "r", encoding="utf-8") as f:
    scraper_content = f.read()

scroll_target = '''                    let scroller = document.querySelector('#_pcmap_list_scroll_container');
                    if (!scroller) {
                        // 스크롤 가능한 가장 큰 영역 찾기
                        let divs = Array.from(document.querySelectorAll('div, ul'));
                        scroller = divs.find(d => d.scrollHeight - d.clientHeight > 1000);
                    }
                    if (scroller) {
                        scroller.scrollBy(0, 800); // 부드럽게 스크롤하여 Lazy 로딩 유발
                    } else {
                        window.scrollBy(0, 800);
                    }'''

scroll_replacement = '''                    if (!window.__dplog_scroller) {
                        window.__dplog_scroller = document.querySelector('#_pcmap_list_scroll_container');
                        if (!window.__dplog_scroller) {
                            let divs = Array.from(document.querySelectorAll('div, ul'));
                            window.__dplog_scroller = divs.find(d => d.scrollHeight - d.clientHeight > 1000) || window;
                        }
                    }
                    if (window.__dplog_scroller.scrollBy) {
                        window.__dplog_scroller.scrollBy(0, 800);
                    } else {
                        window.scrollBy(0, 800);
                    }'''

if target_exists := scroll_target in scraper_content:
    scraper_content = scraper_content.replace(scroll_target, scroll_replacement)

with open("domains/scraping/full_list_extractor.py", "w", encoding="utf-8") as f:
    f.write(scraper_content)

print(f"Patched table and scraper (Success: {target_exists})")
