/**
 * MMFormalizer Benchmark Leaderboard - 完整数据版
 */

// 1. 全局变量
var table;

// 2. 蓝色热力图格式化函数
var colorFormatter = function (cell) {
    var val = cell.getValue();

    // 处理空值或无效值
    if (val === null || val === undefined || val === "" || val === "--") {
        return "--";
    }

    // 强制转换为浮点数
    var num = Number(parseFloat(val));

    if (isNaN(num)) {
        return val; // 如果不是数字则原样返回
    }

    // --- 核心修改：强制保留一位小数 ---
    var displayValue = num.toFixed(1);

    // 设置热力图背景颜色
    var alpha = Math.min(num / 100, 0.8);
    cell.getElement().style.backgroundColor = "rgba(70, 130, 240, " + alpha + ")";
    cell.getElement().style.color = num > 50 ? "#fff" : "#000";
    cell.getElement().style.fontWeight = "500";

    return displayValue;
};

// 3. 全局切换函数 (供 HTML 中的 onclick 调用)
function switchDomain(domain, el) {
    if (!table) return;
    // 切换按钮高亮
    document.querySelectorAll('.tabs li').forEach(li => li.classList.remove('is-active'));
    el.classList.add('is-active');
    // 更新表格列结构
    updateTableStructure(domain);
}

// 4. 列结构更新逻辑 (互斥显示)
function updateTableStructure(domain) {
    let baseCols = [{title: "METRIC", field: "metric", width: 140, frozen: true}];
    let dynamicCols = [];

    if (domain === 'MathVerse') {
        dynamicCols = [
            {title: "Plane Geometry", field: "mv_p", formatter: colorFormatter},
            {title: "Solid Geometry", field: "mv_s", formatter: colorFormatter},
            {title: "Function", field: "mv_f", formatter: colorFormatter}
        ];
    } else if (domain === 'PhyX') {
        dynamicCols = [
            {title: "Modern", field: "px_mo", formatter: colorFormatter},
            {title: "Mechanics", field: "px_me", formatter: colorFormatter},
            {title: "Electromagnetism", field: "px_el", formatter: colorFormatter},
            {title: "Thermodynamics", field: "px_th", formatter: colorFormatter},
            {title: "Thermo pass@3", field: "px_k", formatter: colorFormatter}
        ];
    } else if (domain === 'Synthetic') {
        dynamicCols = [
            {title: "Plane Geometry", field: "sy_p", formatter: colorFormatter},
            {title: "Solid Geometry", field: "sy_s", formatter: colorFormatter}
        ];
    } else if (domain === 'Analytic') {
        dynamicCols = [
            {title: "Plane Geometry", field: "an_p", formatter: colorFormatter},
            {title: "Solid Geometry", field: "an_s", formatter: colorFormatter}
        ];
    }
    table.setColumns(baseCols.concat(dynamicCols));
}

// 5. 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {

    // 核心数据集 (从 LaTeX 完整录入 - 仅 Img 模式)
    var tableData = [
        // --- GPT-5 ---
        { model: "GPT-5", metric: "Compile", mv_p: 24.0, mv_s: 28.0, mv_f: 80.0, px_mo: 71.4, px_me: 71.4, px_el: 66.7, px_th: 0.0, px_k: 100.0, sy_p: 40.0, sy_s: 10.0, an_p: 40.0, an_s: 20.0 },
        { model: "GPT-5", metric: "Semantics", mv_p: 20.0, mv_s: 28.0, mv_f: 30.0, px_mo: 71.4, px_me: 71.4, px_el: 50.0, px_th: 0.0, px_k: 100.0, sy_p: 40.0, sy_s: 0.0, an_p: 20.0, an_s: 20.0 },
        { model: "GPT-5", metric: "Human Check", mv_p: 12.0, mv_s: 28.0, mv_f: 30.0, px_mo: 42.9, px_me: 71.4, px_el: 50.0, px_th: 0.0, px_k: 80.0, sy_p: 20.0, sy_s: 10.0, an_p: 20.0, an_s: 0.0 },

        // --- Gemini-3-Pro ---
        { model: "Gemini-3-Pro", metric: "Compile", mv_p: 76.0, mv_s: 52.0, mv_f: 100.0, px_mo: 14.3, px_me: 28.6, px_el: 16.7, px_th: 0.0, px_k: 60.0, sy_p: 70.0, sy_s: 80.0, an_p: 60.0, an_s: 60.0 },
        { model: "Gemini-3-Pro", metric: "Semantics", mv_p: 76.0, mv_s: 52.0, mv_f: 40.0, px_mo: 14.3, px_me: 28.6, px_el: 33.3, px_th: 0.0, px_k: 40.0, sy_p: 70.0, sy_s: 80.0, an_p: 60.0, an_s: 40.0 },
        { model: "Gemini-3-Pro", metric: "Human Check", mv_p: 72.0, mv_s: 52.0, mv_f: 40.0, px_mo: 14.3, px_me: 28.6, px_el: 33.3, px_th: 0.0, px_k: 20.0, sy_p: 40.0, sy_s: 50.0, an_p: 60.0, an_s: 40.0 },

        // --- Gemini-2.5-Pro ---
        { model: "Gemini-2.5-Pro", metric: "Compile", mv_p: 24.0, mv_s: 32.0, mv_f: 60.0, px_mo: 14.3, px_me: 0.0, px_el: 0.0, px_th: 0.0, px_k: 40.0, sy_p: 30.0, sy_s: 30.0, an_p: 20.0, an_s: 60.0 },
        { model: "Gemini-2.5-Pro", metric: "Semantics", mv_p: 20.0, mv_s: 24.0, mv_f: 60.0, px_mo: 14.3, px_me: 0.0, px_el: 0.0, px_th: 0.0, px_k: 20.0, sy_p: 30.0, sy_s: 10.0, an_p: 20.0, an_s: 40.0 },
        { model: "Gemini-2.5-Pro", metric: "Human Check", mv_p: 20.0, mv_s: 24.0, mv_f: 60.0, px_mo: 0.0, px_me: 0.0, px_el: 0.0, px_th: 0.0, px_k: 20.0, sy_p: 20.0, sy_s: 10.0, an_p: 20.0, an_s: 60.0 },

        // --- Qwen3-VL-235B ---
        { model: "Qwen3-VL-235B", metric: "Compile", mv_p: 28.0, mv_s: 20.0, mv_f: 30.0, px_mo: 0.0, px_me: 0.0, px_el: 0.0, px_th: 0.0, px_k: 0.0, sy_p: 0.0, sy_s: 0.0, an_p: 20.0, an_s: 20.0 },
        { model: "Qwen3-VL-235B", metric: "Semantics", mv_p: 16.0, mv_s: 16.0, mv_f: 20.0, px_mo: 0.0, px_me: 0.0, px_el: 0.0, px_th: 0.0, px_k: 0.0, sy_p: 0.0, sy_s: 0.0, an_p: 20.0, an_s: 20.0 },
        { model: "Qwen3-VL-235B", metric: "Human Check", mv_p: 12.0, mv_s: 12.0, mv_f: 10.0, px_mo: 0.0, px_me: 0.0, px_el: 0.0, px_th: 0.0, px_k: 0.0, sy_p: 0.0, sy_s: 0.0, an_p: 0.0, an_s: 20.0 },

        // --- Qwen2.5-VL-72B ---
        { model: "Qwen2.5-VL-72B", metric: "Compile", mv_p: 0.0, mv_s: 12.0, mv_f: 20.0, px_mo: 0.0, px_me: 0.0, px_el: 0.0, px_th: 0.0, px_k: 0.0, sy_p: 10.0, sy_s: 0.0, an_p: 0.0, an_s: 0.0 },
        { model: "Qwen2.5-VL-72B", metric: "Semantics", mv_p: 0.0, mv_s: 8.0, mv_f: 0.0, px_mo: 0.0, px_me: 0.0, px_el: 0.0, px_th: 0.0, px_k: 0.0, sy_p: 0.0, sy_s: 0.0, an_p: 0.0, an_s: 0.0 },
        { model: "Qwen2.5-VL-72B", metric: "Human Check", mv_p: 0.0, mv_s: 4.0, mv_f: 0.0, px_mo: 0.0, px_me: 0.0, px_el: 0.0, px_th: 0.0, px_k: 0.0, sy_p: 0.0, sy_s: 0.0, an_p: 0.0, an_s: 0.0 },

        { model: "GPT-4o", metric: "Compile", mv_p: 24.0, mv_s: 12.0, mv_f: 40.0, px_mo: 0.0, px_me: 0.0, px_el: 0.0, px_th: 0.0, px_k: 0.0, sy_p: 10.0, sy_s: 0.0, an_p: 0.0, an_s: 0.0 },
        { model: "GPT-4o", metric: "Semantics", mv_p: 0.0, mv_s: 0.0, mv_f: 0.0, px_mo: 0.0, px_me: 0.0, px_el: 0.0, px_th: 0.0, px_k: 0.0, sy_p: 0.0, sy_s: 0.0, an_p: 0.0, an_s: 0.0 },
        { model: "GPT-4o", metric: "Human Check", mv_p: 0.0, mv_s:0.0, mv_f: 0.0, px_mo: 0.0, px_me: 0.0, px_el: 0.0, px_th: 0.0, px_k: 0.0, sy_p: 0.0, sy_s: 0.0, an_p: 0.0, an_s: 0.0 }

    ];

    // 初始化 Tabulator 实例
    table = new Tabulator("#benchmark-table", {
        data: tableData,
        layout: "fitColumns",
        groupBy: "model",
        groupHeader: function(value) {
            // 模型标题行样式
            return `<div class="model-header-text">${value.toUpperCase()}</div>`;
        },
        columnHeaderVertAlign: "bottom",
        columns: [
            {title: "METRIC", field: "metric", width: 140, frozen: true},
            // 初始加载 MathVerse 对应的三列
            {title: "Plane Geometry", field: "mv_p", formatter: colorFormatter},
            {title: "Solid Geometry", field: "mv_s", formatter: colorFormatter},
            {title: "Function", field: "mv_f", formatter: colorFormatter}
        ]
    });
});