(function (window, document) {

    /*
    EVENT HANDLERS
    onColorPickerEnabled
    onChange: e.value = "THIS COLOR"
    onColorPickerDisable
    */

    function init() {
        var colorPickers = document.querySelectorAll(".colorPicker");
        colorPickers.forEach((colorPicker) => {
            colorPicker.enableColorPicker = enableColorPicker;
            colorPicker.disableColorPicker = disableColorPicker;
            trigger = colorPicker.getAttribute("trigger");
            if (trigger) {
                trigger = document.getElementById(trigger);
                trigger.addEventListener('click', function (e) {
                    colorPicker.enableColorPicker();
                });
            }
        });
    }
    function getTargetFromColorPicker(colorPicker) {
        target = document.getElementById(colorPicker.getAttribute("for"));
        return target;
    }

    function getColorPickerFromTarget(target) {
        colorPicker = document.querySelector("[for=" + target.id + "]");
        return colorPicker;
    }

    function getContextFromImg(img) {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, img.width, img.height);
        return context
    }

    function RGBToHex(r, g, b, a = 255) {
        r = r.toString(16);
        g = g.toString(16);
        b = b.toString(16);
        a = a.toString(16);

        if (r.length == 1)
            r = "0" + r;
        if (g.length == 1)
            g = "0" + g;
        if (b.length == 1)
            b = "0" + b;
        if (a.length == 1)
            a = "0" + a;

        return "#" + r + g + b + a;
    }

    function triggerEvent(colorPicker, eventName) {
        target = getTargetFromColorPicker(colorPicker);
        colorPicker.dispatchEvent(new CustomEvent(eventName, {
            bubbles: true,
            detail: {
                target: target,
                colorPicker: colorPicker,
                value: colorPicker.getAttribute("color")
            },
        }));
        htmlHandler = colorPicker.getAttribute(eventName);
        if (htmlHandler) {
            args = { value: colorPicker.getAttribute("color") };
            if (typeof window[htmlHandler] === 'function') {
                window[htmlHandler](args)
            }
            else {
                function evalInContext() {
                    eval(htmlHandler);
                }
                evalInContext.call(args);
            }
        }
    }

    function enableColorPicker() {
        colorPicker = this;
        target = getTargetFromColorPicker(colorPicker);
        target.context = getContextFromImg(target);
        target.addEventListener('click', onColorPickerClick);
        target.addEventListener('mousemove', onColorPickerMove);
        target.addEventListener('mouseleave', onColorPickerMove);
        target.addEventListener('touchstart', onColorPickerMove);
        target.addEventListener('touchmove', onColorPickerMove);
        target.addEventListener('touchend', onColorPickerClick);
        triggerEvent(colorPicker, "onColorPickerEnabled")
    }

    function disableColorPicker() {
        colorPicker = this;
        target = getTargetFromColorPicker(colorPicker);
        colorPicker.style.display = "none";
        target.className = target.className.replace("colorPickerCursor", "").trim();
        target = document.getElementById(colorPicker.getAttribute("for"));
        target.removeEventListener('click', onColorPickerClick);
        target.removeEventListener('mousemove', onColorPickerMove);
        target.removeEventListener('mouseleave', onColorPickerMove);
        target.removeEventListener('touchstart', onColorPickerMove);
        target.removeEventListener('touchmove', onColorPickerMove);
        target.removeEventListener('touchend', onColorPickerClick);
        triggerEvent(colorPicker, "onColorPickerDisabled")
        target.context = null;
    }

    function onColorPickerMove(e) {
        colorPicker = getColorPickerFromTarget(e.target);
        cls = e.target.className.replace("colorPickerCursor", "").trim();
        e.target.className = cls + " colorPickerCursor";
        pageX = e.pageX ?? e.touches[0].pageX;
        pageY = e.pageY ?? e.touches[0].pageY;
        x = pageX - e.target.ownerDocument.defaultView.scrollX - e.target.getBoundingClientRect().x;
        y = pageY - e.target.ownerDocument.defaultView.scrollY - e.target.getBoundingClientRect().y;
        if (x >= 0 && x < e.target.width && y >= 0 && y < e.target.height) {
            colorPicker.style.display = "block";
            cls = colorPicker.className.replace("touchenabled", "").trim();
            colorPicker.className = cls + (e.pageX ? "" : " touchenabled");
            colorPicker.style.top = pageY + "px";
            colorPicker.style.left = pageX + "px";
            pixel = e.target.context.getImageData(x, y, 1, 1)['data'];
            colorPicker.style.background = RGBToHex(pixel[0], pixel[1], pixel[2], pixel[3]);
            colorPicker.setAttribute("color", RGBToHex(pixel[0], pixel[1], pixel[2], pixel[3]));
        }
        else
            colorPicker.style.display = "none";
        e.preventDefault();
    }

    async function onColorPickerClick(e) {
        colorPicker = getColorPickerFromTarget(e.target);
        triggerEvent(colorPicker, "onchange")
        colorPicker.disableColorPicker();
        e.stopPropagation();
        return false;
    }

    document.addEventListener('DOMContentLoaded', init);
}
)(window, document);