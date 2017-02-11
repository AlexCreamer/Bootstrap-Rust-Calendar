function initPartial(elt) {
	$('code').each(function() {
		var codeContent = $(this).html();

		codeContent = codeContent.replace(/</g, '&lt;');
		codeContent = codeContent.replace(/>/g, '&gt;');
		codeContent = codeContent.replace(/\n/g, '<br />');
		codeContent = codeContent.replace(' ', '&nbsp;');
		codeContent = codeContent.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

		$(this).html(codeContent);

		if($(this).children().first().is('br')) {
			$(this).children().first().remove();
		}
	});
}

function createCodePanel(codeHtml) {
	var codeContainer = $(document.createElement('div'));
	codeContainer.addClass('panel panel-default');

	var codeHeader  = $(document.createElement('div'));
	codeHeader.addClass('panel-heading');
	codeHeader.text('Code');

	codeContainer.append(codeHeader);

	var codeBody  = $(document.createElement('div'));
	codeBody.addClass('panel-body');

	var code = $(document.createElement('code'));
	code.html(codeHtml);

	codeBody.append(code);

	codeContainer.append(codeBody);

	return codeContainer;
}

function openUrl(url) {
	var selectedMenus = url.split('/');

	if(selectedMenus.length > 0 && $('.menu li[data-url]:contains(' + selectedMenus[0] +')').length) {
		openMenu($('.menu li[data-url]:contains(' + selectedMenus[0] +')'), function() {
			if(selectedMenus.length > 1 && $('.left-menu li[data-url]:contains(' + selectedMenus[1] +')').length) {
				openLeftMenu($('.left-menu li[data-url]:contains(' + selectedMenus[1] +')'));
			}
			else if($('.left-menu li.default').length) {
				openLeftMenu($('.left-menu li.default'));
			}
		});
	}
}

function openMenu(elt, success) {
	$('#main > .content').html('<span class="fa fa-spinner fa-spin"></span>');

	$('.menu li.selected').removeClass('selected');
	$(elt).addClass('selected');

	var title = $(elt).text();
	var subTitle = $(elt).data('subtitle');
	$('#title > .site-content > h1').text(title);
	$('#title > .site-content > h2').text(subTitle ? subTitle : '');

	window.location.hash = title;
	document.title = title + ' - bootstrap-year-calendar';

	if($(elt).data('full-page')) {
		$('#main > .site-content').addClass('full');
	}
	else {
		$('#main > .site-content').removeClass('full');
	}

	$.ajax({
		url: $(elt).data('url'),
		success: function(data) {
			$('#main > .site-content').html(data);

			initPartial($('#main > .site-content'));

			if(success != null) {
				success();
			}
		},
		error: function() {
			$('#main > .site-content').html('<h2>An error happens during the page loading.</h2>')
		}
	});
}

function openLeftMenu(elt, success) {
	$('.sub-content').html('<span class="fa fa-spinner fa-spin"></span>');

	$('.left-menu li.selected').removeClass('selected');
	$(elt).addClass('selected');

	var title = $(elt).text();
	$('.sub-content-title').text(title);

	var selectedMenus = window.location.hash.substr(1).split('/');
	selectedMenus[1] = title;
	window.location.hash = selectedMenus.join('/');

	$.ajax({
		url: $(elt).data('url'),
		success: function(data) {
			$('.sub-content').html(data);
			$('.sub-content .publish').each(function() {
				$('.sub-content').append(createCodePanel($(this).html()));
			});

			initPartial($('.sub-content'));

			if(success != null) {
				success();
			}
		},
		error: function() {
			$('.sub-content').empty();
			$('.sub-content-title').text('An error happens during the page loading.');
		}
	});
}

$(function() {
	initPartial($(document));

	$('#banner .menu-button').click(function() {
		if($('#banner ul.menu').is(':visible')) {
			$('#banner ul.menu').slideUp(function() { $(this).css('display', ''); });
		}
		else {
			$('#banner ul.menu').slideDown();
		}
	});

	$('#banner .menu').click(function() {
		if($('#banner .menu-button').is(':visible')) {
			$('#banner ul.menu').slideUp(function() { $(this).css('display', ''); });
		}
	});

	$('.menu li[data-url]').click(function() {
		openMenu($(this), function() {
			if($('.left-menu li.default').length) {
				openLeftMenu($('.left-menu li.default'));
			}
		});
	});

	$('body').on('click', '.left-menu li[data-url]', function() {
		openLeftMenu($(this));
	});

	if(window.location.hash) {
		openUrl(window.location.hash.substr(1));
		/*var selectedMenus = window.location.hash.substr(1).split('/');

		if(selectedMenus.length > 0 && $('.menu li[data-url]:contains(' + selectedMenus[0] +')').length) {
			openMenu($('.menu li[data-url]:contains(' + selectedMenus[0] +')'), function() {
				if(selectedMenus.length > 1 && $('.left-menu li[data-url]:contains(' + selectedMenus[1] +')').length) {
					openLeftMenu($('.left-menu li[data-url]:contains(' + selectedMenus[1] +')'));
				}
				else if($('.left-menu li.default').length) {
					openLeftMenu($('.left-menu li.default'));
				}
			});
		}*/
	}
});
