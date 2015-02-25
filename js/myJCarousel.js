// JavaScript Document by Stanley Ilukhor

(function($) {
	$.fn.myJCarousel = function(options){
		var opts = $.extend({}, $.fn.myJCarousel.defaults, options);
		return this.each(function() {
			var $paraCont = $(this),

			// main photo slider
			$eSlider = $('.photos', $paraCont),

			// all the li photo elems in slider
			$eSliderElms = $eSlider.children(),

			// total count of li photo elems
			iSliderCount = $eSliderElms.length,

			// the navigation buttons
			$ePrev = $('.prev', $paraCont),
			$eNext = $('.next', $paraCont),

			// background images
			$eBg1 = $('.bg1', $paraCont),
			$eBg2 = $('.bg2', $paraCont),

			// current photo on display
			curPhoto = 0,

			// the thumb container
			$eThumbsCont = $('.thumbs', $paraCont),

			// the thumbs
			$eThumbs = $eThumbsCont.children(),

			//the interval object for autoplay mode
			slideShow,

			// the loading images
			$eLoading = $('.loading', $paraCont),

			// the slider wrapper
			$eSliderWrapper = $('.photo-wrapper', $paraCont);

			// first, preload all the images
			var iLoaded = 0,

			$eImages = $eSliderWrapper.find('img');

			$eImages.each(function(){
				var $eImg = $(this);
				$('<img/>').load(function(){
					++iLoaded;
					if (iLoaded == iSliderCount * 2 ){
						$eLoading.hide();
						$eSliderWrapper.show();

						// width of images
						// (assuming all images have same sizes)
						var iImageWidth = $eSlider.find('img:first').width();

						/* set the width of the slider, of each one of
						 * its elements, and of the navigation buttons
						 */
						_setWidth($eSlider, $eSliderElms, iSliderCount, $eBg1, $eBg2, iImageWidth, $ePrev, $eNext);

						/*
						 * set the widths of the thumbs
						 * and spread them evenly
						 */
						 $eThumbsCont.css({
							'width' : iImageWidth + 'px',
							'margin-left' : -iImageWidth/2 + 'px',
						 });

						 var iSpaces = iImageWidth/(iSliderCount + 1);

						 $eThumbs.each(function(i){
							var $this = $(this);
							var left =  iSpaces * (i + 1) - $this.width()/2;
							$this.css('left', left + 'px');

							if (opts.thumbRotation) {
								var angle = Math.floor(Math.random()* 41) - 20;
								$this.css({
									 'transform'         : 'rotate('+ angle +'deg)',
									 '-webkit-transform' : 'rotate('+ angle +'deg)',
									 '-ms-transform'    : 'rotate('+ angle +'deg)',
									 '-moz-transform'    : 'rotate('+ angle +'deg)',
									 '-o-transform'    : 'rotate('+ angle +'deg)'
								});
							}

							// hovering the thumbs animates them up and down
							$this.bind('mouseenter', function(){
								$(this).stop().animate({ top : '-10px' }, 100);

								$this.css({
									'padding' :' 3px',
									'background': '#9c3',
									'opacity' : '1.0',

									'transition-property' : 'background, opacity',
									'transition-duration' : '2s',
									'transition-timing-function' : 'ease',

									'-moz-transition-property' : 'background, opacity',
									'-moz-transition-duration' : '2s',
									'-moz-transition-timing-function' : 'ease',

									'-webkit-transition-property' : 'background, opacity',
									'-webkit-transition-duration' : '2s',
									'-webkit-transition-timing-function' : 'ease'
								});

							}).bind('mouseleave', function(){
								$(this).stop().animate({ top : '0px' }, 100);
								angle = 360;
								$this.css({
									'padding' : '0px',
									'background': '#fff',
									'opacity' : '0.7',

									'transition-property' : 'background, opacity',
									'transition-duration' : '2s',
									'transition-timing-function' : 'ease',

									'-moz-transition-property' : 'background, opacity',
									'-moz-transition-duration' : '2s',
									'-moz-transition-timing-function' : 'ease',

									'-webkit-transition-property' : 'background, opacity',
									'-webkit-transition-duration' : '2s',
									'-webkit-transition-timing-function' : 'ease',
								});
							});
						});

						//make the first thumb to be selected
						_highlight($eThumbs.eq(0));

						//slide, when clicking the navigation buttons
						// Prev
						$ePrev.bind('click',function(){
							--curPhoto;
							if(curPhoto < 0)
								if(opts.circular)
									curPhoto = iSliderCount -  1;
								else {
									++curPhoto;
									return false;
								}
							_highlight($eThumbs.eq(curPhoto));
							_slide(curPhoto, $eSlider, $eBg1, $eBg2, opts.speed, opts.easing, opts.easingBg);
						});

						// Next
						$eNext.bind('click',function(){
							++curPhoto;
							if(curPhoto >= iSliderCount)
								if(opts.circular)
									curPhoto = 0;
								else {
									--curPhoto;
									return false;
								}
							_highlight($eThumbs.eq(curPhoto));
							_slide(curPhoto, $eSlider, $eBg1, $eBg2, opts.speed, opts.easing, opts.easingBg);
						});

						/* clicking a thumb will slide to the respective image
						*/
						$eThumbs.bind('click',function(){
							var $thumb  = $(this);
							_highlight($thumb);

							//if autoplay interrupt when user clicks
							if(opts.auto)
								clearInterval(slideShow);

							curPhoto = $thumb.index();

							_slide(curPhoto, $eSlider, $eBg1, $eBg2, opts.speed, opts.easing, opts.easingBg);
						});

					   /* activate the autoplay mode if
						* that option was specified
						*/
						if(opts.auto != 0){
							opts.circular  = true;
							slideShow = setInterval(function(){
								$eNext.trigger('click');
							}, opts.auto);
						}

					   /* when resizing the window,
						* we need to recalculate the widths of the
						* slider elements, based on the new window width;
						* we need to slide again to the current one,
						* since the left of the slider is no longer correct
						*/
						$(window).resize(function(){
							winWidth = $(window).width();

							_setWidth($eSlider, $eSliderElms, iSliderCount, $eBg1, $eBg2, iImageWidth, $ePrev, $eNext);

							_slide(curPhoto, $eSlider, $eBg1, $eBg2, 1, opts.easing, opts.easingBg);
						});
					}
				}).error(function(){
					alert("true");
				}).attr('src', $eImg.attr('src'));
			});
		});
	};

	// current window width
	var winWidth = $(window).width();

	var _slide =  function(curPhoto, $slider, $bg1, $bg2, speed, easing, easingBg){
		var slideTo = parseInt(-winWidth * curPhoto);
		$slider.stop().animate({
			left : slideTo + "px"
		}, speed, easing);

		$bg1.stop().animate({
			left : slideTo/8 + 'px'
		}, speed, easing);

		$bg2.stop().animate({
			right : slideTo/4 + 'px'
		}, speed, easing);
	}

	var _highlight = function($elm) {
		$elm.siblings().removeClass('selected');
		$elm.addClass('selected');
	}

	var _setWidth = function($slider, $elms, $elmsCount, $bg1, $bg2, imgWidth, $prev, $next){
		/* the width of the slider is the window width
		 * times the total number of elements in the slider
		 */
		var sliderW = winWidth * $elmsCount;
		$slider.width(sliderW + 'px');

		//each element will have a width = windows width
		$elms.width(winWidth + 'px');

		/*
		 * we also set the width of each bg image div.
		 * The value is the same calculated for the pxs_slider
		 */
		$bg1.width(sliderW + 'px');
		$bg2.width(sliderW + 'px');

		/*
		 * both, the right and left of the
		 * navigation next and previous buttons will be:
		 * windowWidth/2 - imgWidth/2 + some margin
		 * (not to touch the image borders)
		 */
		var navPos = winWidth/2 - imgWidth/2 - 100;
		$next.css('right', navPos + 'px');
		$prev.css('left', navPos + 'px');
	}

	$.fn.myJCarousel.defaults = {
		clsPrefix		: '.ambt-fb-photos-',
		auto            : 0,
		speed           : 1000,
		easing          : 'swing',
		easingBg        : 'swing',
		circular        : true,
		thumbRotation   : true
	};
})(jQuery);