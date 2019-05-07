// ==UserScript==
// @name         gta jobs filter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Hide likes more than a certain proportion of the figure
// @author       alvin
// @match        https://*.socialclub.rockstargames.com/jobs*
// @grant        none
// @require      http://code.jquery.com/jquery-2.1.1.min.js
// ==/UserScript==

(function() {
    'use strict';

    let timer;

    // 定时修改隐藏已经修改的
    function updateJobsList(FILTER_MIN, FILTER_MAX, FILTER_PLAY, FILTER_COLLECTED, FILTER_PLAYED, FILTER_RUSSIA)
    {
        let count = 0;          // 需要保留的有几个
        let removeCount = 0;    // 需要过滤掉的有几个
        // 统计数量
        $.each($('.UI__Card__card'), function(i,value){
            let liked = $(value).find('span')[1].innerHTML;
            liked = unitFormat(liked);
            let unliked = $(value).find('span')[3].innerHTML;
            unliked = unitFormat(unliked);

            let all = liked + unliked;

            let rate = all != 0 ? (liked / all).toFixed(2) : 0;

            // 统计
            let mark = false;

            if (FILTER_MIN != 0 && rate < FILTER_MIN) {     // 好评率最小值过滤
                mark = true;
            }
            if (FILTER_MAX != 0 && rate > FILTER_MAX) {     // 好评率最大值过滤
                mark = true;
            }
            if (FILTER_PLAY != 0 && all <= FILTER_PLAY) {    // 过滤至少游玩人数
                mark = true;
            }
            if (FILTER_COLLECTED) {                          // 过滤已收藏
                if ($(value).find('a.Social__liked__HZDh7').length > 0) {
                    mark = true;
                }
            }
            if (FILTER_PLAYED) {                             // 过滤已经玩过
                if ($(value).find('span.UgcCard__playedLabel__3rgOv').length > 0) {
                    mark = true;
                }
            }
            if (FILTER_RUSSIA) {                             // 过滤毛子图
                let name = $(value).find('h2.UgcCard__name__3asOk').html();
                let description = $(value).find('div.UgcCard__description__2nOkP').html();
                if (russianFilter(name) || russianFilter(description)) {
                    mark = true;
                }
            }

            // 处理标记
            if (mark == false) {
                count ++;
            } else {
                removeCount ++;
            }
        });

        // 执行过滤
        $.each($('.UI__Card__card'), function(i,value){
            let liked = $(value).find('span')[1].innerHTML;
            liked = unitFormat(liked);
            let unliked = $(value).find('span')[3].innerHTML;
            unliked = unitFormat(unliked);

            let all = liked + unliked;

            let rate = all != 0 ? (liked / all).toFixed(2) : 0;

            let mark = false;

            if (FILTER_MIN != 0 && rate < FILTER_MIN) {     // 好评率最小值过滤
                mark = true;
            }
            if (FILTER_MAX != 0 && rate > FILTER_MAX) {     // 好评率最大值过滤
                mark = true;
            }
            if (FILTER_PLAY != 0 && all <= FILTER_PLAY) {    // 过滤至少游玩人数
                mark = true;
            }
            if (FILTER_COLLECTED) {                          // 过滤已收藏
                if ($(value).find('a.Social__liked__HZDh7').length > 0) {
                    mark = true;
                }
            }
            if (FILTER_PLAYED) {                             // 过滤已经玩过
                if ($(value).find('span.UgcCard__playedLabel__3rgOv').length > 0) {
                    mark = true;
                }
            }
            if (FILTER_RUSSIA) {                             // 过滤毛子图
                let name = $(value).find('h2.UgcCard__name__3asOk').html();
                let description = $(value).find('div.UgcCard__description__2nOkP').html();
                if (russianFilter(name) || russianFilter(description)) {
                    mark = true;
                }
            }

            // 处理标记
            if (mark == true) {
                // 遮罩展示

                //if (count >= 10) {
                $(value).remove();
                //}
            } else {
                $(value).find('span')[5].innerHTML = '' + number((rate*100), 2) + '%';
            }
        });
    }

    // 把格式化的数字字符串逆转为数值
    function unitFormat(input) {
        let unit = input.substr(input.length-1,1);
        if (unit == 'k' || unit == 'K') {
            return parseFloat(input.substr(0, input.length-1)) * 1000;
        } else if (unit == 'm' || unit == 'M') {
            return parseFloat(input.substr(0, input.length-1)) * 1000000;
        } else if (unit == 'g' || unit == 'G') {
            return parseFloat(input.substr(0, input.length-1)) * 1000000000;
        }
        return parseFloat(input);
    }

    // 自定义保留几位小数
    function number(data,val){
        let factor = 1;
        for (let i = 0; i < val; i++) {
            factor = factor * 10;
        }
        return Math.floor(data * factor) / factor;
    }

    function russianFilter(content) {
        if(/[а-яА-ЯЁё]/.test(content)){
            return true;
        }
        return false;
    }

    // 模拟下拉到最下方
    function scollWindow(status) {
        if (status) {
            timer = setInterval(function() {
                scroll(0, document.body.scrollHeight);
            }, 500);
        } else {
            clearInterval(timer)
        }
    }

    function jobs()
    {
        if ($('#gta_filter_button').html() == '开') {
            // 获取设置值
            let FILTER_MAX = $('#gta_filter_rating_max').val();          // 好评率接受的最大值
            let FILTER_MIN = $('#gta_filter_rating_min').val();           // 好评率接受的最小值
            let FILTER_PLAY = $('#gta_filter_play').val();           // 最少游玩人数 0：禁用该过滤
            let FILTER_COLLECTED = $('#gta_filter_collected')[0].checked;   // 是否过滤已经收藏过的
            let FILTER_PLAYED = $('#gta_filter_played')[0].checked;      // 是否过滤已经玩过的
            let FILTER_RUSSIA = $('#gta_filter_russian')[0].checked;      // 毛子过滤器

            updateJobsList(FILTER_MIN, FILTER_MAX, FILTER_PLAY, FILTER_COLLECTED, FILTER_PLAYED, FILTER_RUSSIA);
        }
    }

    function run() {
        // 注入输入框，按钮等
        let div = document.createElement("div");
        let divStr = '<div id="gta_jobs_filter_container" style="right:10px;bottom:20px;z-index: 9999;position: fixed;width: 200px;height: 200px;border:4px; background:#aaaaaa;color:red;">' +
            'gta jobs fliter<br>' +
            '过滤好评率：<input id="gta_filter_rating_min" value="0" style="width: 40px"/> - <input id="gta_filter_rating_max" value="0" style="width: 40px"/><br>' +
            '过滤游玩数：<input id="gta_filter_play" value="0" style="width: 80px"/> <br>' +
            '过滤已收藏：<input type="checkbox" id="gta_filter_collected"/> <br>' +
            '过滤已玩过：<input type="checkbox" id="gta_filter_played"/> <br>' +
            '过滤毛子图：<input type="checkbox" id="gta_filter_russian"/> <br>' +
            '当前状态：<button id="gta_filter_button">关</button>'
        '</div>';
        div.innerHTML = divStr;
        $('body').append(div);
        $('html').css('overflow', 'scroll');

        $('#gta_filter_button').click(function(){
            if ($(this).html() == '关') {
                $(this).html('开');
                $('#gta_filter_rating_min').attr('readonly', true);
                $('#gta_filter_rating_max').attr('readonly', true);
                scollWindow(true);
            } else {
                $(this).html('关');
                $('#gta_filter_rating_min').attr('readonly', false);
                $('#gta_filter_rating_max').attr('readonly', false);
                scollWindow(false);
            }
        });

        // 每半秒定时跑一次过滤，随着往下拉，就能得到过滤后的数据了
        setInterval(function(i, val){
            jobs();
        },500);
    }

    run();
})();