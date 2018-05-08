$(document).ready(function(){
	var mesLogo1 = parseFloat($('.partieLogo1').css('right','1000px'));
	var mesLogo2 = parseFloat($('.partieLogo2').css('left','1000px'));
// ---- clignoter click me----
var saClignote;
function FaireClignoterImage (){ 
	$("#clickMe").fadeOut(700).delay(300).fadeIn(600); 
}; 
saClignote = setInterval(FaireClignoterImage,1200); 
// ---- Anim  presentation ----
$('#maTete').click(function(){
	$('.presentation').hide();
	$('.partieLogo1').css({opacity: 1}).fadeIn(4000);
	$('.partieLogo2').css({opacity: 1}).fadeIn(4000);
// ---- Anim  Logo ----
$('.partieLogo1').animate({
	right:'0px'
}, 1000,function(){
	$('.partieLogo1').animate({
		opacity:0
	},2000, function(){
		$('.presentation').show('slide');
		$('#maTete').off('click');
		$('#clickMe').remove();
	});
});
$('.partieLogo2').stop().animate({
	left:'0px'
}, 1000,function(){
	$('.partieLogo2').stop().animate({
		opacity:0
	},2000, function(){  // ---- Anim  Logo Scroll ----
		$('.logoScroll,.logoScroll4').animate({
			"opacity":1
		},1000, function(){
			maFonctionAnimLogo2();
			maFonctionBackgroundAnilLogo();
			console.log(maFonctionAnimLogo2);
		});
	});
});
});
var maFonctionAnimLogo2 = function(){
	$( ".animlog1" ).animate({ "bottom": 0 }, 1000);
	$( ".animlog2" ).animate({ "bottom": 0 }, 1500);
	$( ".animlog3" ).animate({ "bottom": 0 }, 2000);
	$( ".animlog4" ).animate({ "bottom": 0 }, 2500);
	$( ".animlog5" ).animate({ "bottom": 0 }, 3000);
	$( ".animlog6" ).animate({ "bottom": 0 }, 3000);
	$( ".animlog7" ).animate({ "bottom": 0 }, 2500);
	$( ".animlog8" ).animate({ "bottom": 0 }, 2000);
	$( ".animlog9" ).animate({ "bottom": 0 }, 1500);
	$( ".animlog10" ).animate({ "bottom": 0 }, 1000);

};
var maFonctionBackgroundAnilLogo = function(){
	$('.voletslogo').animate({
		'background-color': 'rgba(242,74,88,1)'
	},2000)
}



// ---- Hover  Logo Scroll full ancre1 ----
$('.imgScroll').mouseover(function(){
	$('.imgScroll').attr('src','assets/ninjaCv/images/logoScrollhover.png');
});
$('.imgScroll').mouseout(function(){
	$('.imgScroll').attr('src','assets/ninjaCv/images/logoScroll.png');
});
// ---- Hover  Logo Scroll responsiv ancre1 ----
$('.imgScroll2').mouseover(function(){
	$('.imgScroll2').attr('src','assets/ninjaCv/images/logoScrollhover.png');
});
$('.imgScroll2').mouseout(function(){
	$('.imgScroll2').attr('src','assets/ninjaCv/images/logoScroll.png');
});
// ---- Hover  Logo Cv ----
$('.imgLogoCv, .imgLogoCvyl').mouseover(function(){
	$('.imgLogoCv, .imgLogoCvyl').attr('src','assets/ninjaCv/images/logoCvHover.png');
});
$('.imgLogoCv, .imgLogoCvyl').mouseout(function(){
	$('.imgLogoCv, .imgLogoCvyl').attr('src','assets/ninjaCv/images/logoCv.png');
});
// ---- Hover  Joue Cv ----
$('.imgLogoJoue , .imgLogoJoueyl').mouseover(function(){
	$('.imgLogoJoue , .imgLogoJoueyl').attr('src','assets/ninjaCv/images/logoJoueHover.png');
});
$('.imgLogoJoue , .imgLogoJoueyl').mouseout(function(){
	$('.imgLogoJoue , .imgLogoJoueyl').attr('src','assets/ninjaCv/images/logoJoue.png');
});
// ---- Hover  instruction ----
$('.imgLogoInstructions').mouseover(function(){
	$('.imgLogoInstructions').attr('src','assets/ninjaCv/images/logo-instructions-hover.png');
});
$('.imgLogoInstructions').mouseout(function(){
	$('.imgLogoInstructions').attr('src','assets/ninjaCv/images/logo-instructions.png');
});
// ---- clic instructions ----
$('.imgLogoInstructions').click(function(){
	$('.instructions').css({display:'block'});
	$('.titreNinjaCv').hide();
	$('.imgLogoJoue').hide();
	$('.imgLogoCv').hide();
	$('.imgLogoInstructions').hide();
});

$('.imgInstructions').click(function(){
	$('.instructions').css({display:'none'});
	$('.titreNinjaCv').show();
	$('.imgLogoJoue').show();
	$('.imgLogoCv').show();
	$('.imgLogoInstructions').show();

});
// fonction scroll automatique
$('a[href^="#"]').click(function(){  
	var id = $(this).attr("href");
	var offset = $(id).offset().top 
	$('html, body').animate({scrollTop: offset}, 'slow'); 
	return false;  
}); 
// ---- hover ma tete ----
$('.presentation').stop().css({display: 'none', opacity: 1}).fadeIn(4000);
$( "#maTete" ).hover(function() {
	$( this ).fadeTo( 0, 1, function(){
		$('#maTete').attr("src","assets/ninjaCv/images/photoProfilhover.png");
	});
});
$('#maTete').stop().css({display: 'none', opacity: 1}).fadeIn(3000);
// machine a ecrire
var text = 'Afin d\'en apprendre d\'avantage sur mes compétences je vous propose de jouer à mon Jeu-video<br>Réalisé en Javascript';
var currentChar = 1;
var htmltag = false;
var cache = '';
function type() {
	var str = text.substr(0, currentChar);
	var last = str.substr(str.length - 1, str.length);
	if (last != '<' && last != '>' & last != '/') {
		$("#consoleText2").html(str);
	}
	currentChar++;
	if (currentChar <= text.length) {
		if (last == '<') {
			htmltag = true;
			animTitreNinjaCv();
			$('.logoJoueEtCv').animate({opacity:1},2000);
		} else if (last == '>') {
			htmltag = false;
		}
		if (htmltag) {
			setTimeout(type, 1);
		} else {
			setTimeout(type, 50);
		}
	}
};
/*
var controleScrollConteneurjeu = true;
$(window).scroll(function() {
	var top = $('#ancre3').offset().top;
	var scrollTop = $(window).scrollTop();
	var windowHeight = $(window).height();

	if (windowHeight + scrollTop > top && controleScrollConteneurjeu == true) {
		setTimeout(type,1000);
		controleScrollConteneurjeu = false
	} 
});
*/
//Animation du titre du ninja 
function animTitreNinjaCv (){
	$('.titreNinjaCv').animate({'margin-right': '-986px'},1000,
		function(){
			$('.titreNinjaCv').animate({'margin-right': '986px'},800);
			$('.titreNinjaCv').animate({'opacity': 0},800);
			$('.titreNinjaCv').animate({'margin-right': '250px'},100);
			$('.titreNinjaCv').animate({'opacity': 1},1);
		});
};
$('.imgLogoJoue').click(function(){
	$('.imgLogoInstructions').hide();
	$('.imgLogoJoue').hide()
	$('.imgLogoCv').hide()
	$('#console2').hide()
	$('.titreNinjaCv').hide()
	$('canvas').show()
	$('.logoVie').show()
});
// Anim Competence
var controleScrollCompetenceMobile = true;
$(window).scroll(function() {
	var top = $('#ancre3').offset().top;
	var scrollTop = $(window).scrollTop();
	var windowHeight = $(window).height();

	if (windowHeight + scrollTop > top && controleScrollCompetenceMobile == true) {
		animCompetences();
		controleScrollCompetenceMobile = false
	} 
});
function animCompetences (){
	$('.progress-bar').css('transition', 'none');
	$('#progressHtml,progressJavascript,progressJquery,progressBootstrap,progressAngularJs,progressMongoDb,progressNodeJs,progressExpressJs,progressAjax,progressMeteorJs').css({
		width:'0%',
	});
	$( "#progressHtml" ).animate({
		width:'90%'
	}, 1000, function() {
		$('#progressHtml').css({background:'#E4383F'})
	});
	$( "#progressJavascript" ).animate({
		width:'80%'
	},2000, function() {
		$('#progressJavascript').css({background:'#E4383F'})
	});
	$( "#progressJquery" ).animate({
		width:'80%'
	}, 3000, function() {
		$('#progressJquery').css({background:'#E4383F'})
	});
	$( "#progressBootstrap" ).animate({
		width:'100%'
	}, 4000, function() {
		$('#progressBootstrap').css({background:'#E4383F'})
	});
	$( "#progressAngularJs" ).animate({
		width:'50%'
	}, 5000, function() {
		$('#progressAngularJs').css({background:'#E4383F'})
	});
	$( "#progressMongoDb" ).animate({
		width:'50%'
	}, 1000, function() {
		$('#progressMongoDb').css({background:'#E4383F'})
	});
	$( "#progressNodeJs" ).animate({
		width:'50%'
	}, 2000, function() {
		$('#progressNodeJs').css({background:'#E4383F'})
	});
	$( "#progressExpressJs" ).animate({
		width:'50%'
	}, 3000, function() {
		$('#progressExpressJs').css({background:'#E4383F'})
	});
	$( "#progressAjax" ).animate({
		width:'50%'
	}, 4000, function() {
		$('#progressAjax').css({background:'#E4383F'})
	});
	$( "#progressMeteorJs" ).animate({
		width:'50%'
	}, 5000, function() {
		$('#progressMeteorJs').css({background:'#E4383F'})
	});
};
// logo sociaux
$('.logofacebook,.txtfacebook').mouseover(function(){
	$('.logofacebook').css('background','url(assets/ninjaCv/images/facebook-hover.png)');
	$('.txtfacebook').animate({color:'#43619C'},500);
});
$('.logofacebook,.txtfacebook').mouseout(function(){
	$('.logofacebook').css('background','url(assets/ninjaCv/images/facebook.png)');
	$('.txtfacebook').animate({color:'white'},500);
});
$('.logotwitter,.txttwitter').mouseover(function(){
	$('.logotwitter').css('background','url(assets/ninjaCv/images/twitter-hover.png)');
	$('.txttwitter').animate({color:'#24A9E6'},500);
});
$('.logotwitter,.txttwitter').mouseout(function(){
	$('.logotwitter').css('background','url(assets/ninjaCv/images/twitter.png)');
	$('.txttwitter').animate({color:'white'},500);
});
$('.logolinkedin,.txtlinkedin').mouseover(function(){
	$('.logolinkedin').css('background','url(assets/ninjaCv/images/linkedin-hover.png)');
	$('.txtlinkedin').animate({color:'#187FB8'},500);
});
$('.logolinkedin,.txtlinkedin').mouseout(function(){
	$('.logolinkedin').css('background','url(assets/ninjaCv/images/linkedin.png)');
	$('.txtlinkedin').animate({color:'white'},500);
});
$('.logopinterest,.txtpinterest').mouseover(function(){
	$('.logopinterest').css('background','url(assets/ninjaCv/images/pinterest-hover.png)');
	$('.txtpinterest').animate({color:'#cf1813'},500);
});
$('.logopinterest,.txtpinterest').mouseout(function(){
	$('.logopinterest').css('background','url(assets/ninjaCv/images/pinterest.png)');
	$('.txtpinterest').animate({color:'white'},500);
});

});

