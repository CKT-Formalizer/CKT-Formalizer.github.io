/**
 * MMFormalizer - index.js 
 * 动态兼容版：自动处理各 Topic 图片数量变化，确保切换按钮 100% 可用
 */

window.HELP_IMPROVE_VIDEOJS = false;

$(document).ready(function() {
    // 1. Navbar 手机端菜单逻辑
    $(".navbar-burger").click(function() {
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");
    });

    // 2. 初始化轮播图实例
    var carouselInstances = [];
    $('.results-carousel').each(function() {
        var $this = $(this);
        var itemCount = $this.find('.item').length; // 自动检测当前 Topic 有几张图

        try {
            var instances = bulmaCarousel.attach(this, {
                slidesToScroll: 1,
                slidesToShow: 1,
                // 只有图多于 1 张才开启 loop，防止单张图时 cloneNode 报错
                loop: itemCount > 1,
                infinite: itemCount > 1,
                autoplay: false,
                pagination: true
            });

            if (instances && instances.length > 0) {
                carouselInstances.push(instances[0]);
            }
        } catch (e) {
            console.warn("轮播初始化跳过:", e);
        }
    });

    // 3. 核心切换逻辑：使用委托监听 (Delegation)
    $(document).on('click', '#case-study-tabs li', function(e) {
        e.preventDefault();
        var topic = $(this).data('topic');
        console.log("Detected Click! Switching to:", topic);

        if (!topic) return;

        // A. 切换 Tab 按钮高亮状态
        $('#case-study-tabs li').removeClass('is-active');
        $(this).addClass('is-active');

        // B. 切换内容容器显隐
        $('.case-carousel-group').addClass('is-hidden');
        var $target = $('#' + topic + '-carousel');
        $target.removeClass('is-hidden');

        // C. 强制重绘：解决隐藏转显示后的布局问题
        setTimeout(function() {
            window.dispatchEvent(new Event('resize'));

            // 针对当前显示的容器执行 reset
            if (carouselInstances) {
                carouselInstances.forEach(function(instance) {
                    if (instance.element && instance.element.id === topic + '-carousel') {
                        instance.reset();
                    }
                });
            }
        }, 150);
    });

    // 4. 其他组件初始化 (防止未定义报错)
    if (typeof bulmaSlider !== 'undefined') {
        bulmaSlider.attach();
    }
});