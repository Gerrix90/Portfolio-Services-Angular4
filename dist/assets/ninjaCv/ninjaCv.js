'use strict';

window.document.addEventListener('DOMContentLoaded', function() {


//******************************************POLYFILL REQUESTANIMATION FRAME*****************************************************
window.requestAnimFrame =
    window.requestAnimationFrame || // La fonction d'origine que tous les navigateurs finiront par utiliser.
    window.webkitRequestAnimationFrame || // Pour Chrome et Safari.
    window.mozRequestAnimationFrame || // Pour Firefox.
    window.ORequestAnimationFrame || // Pour Opera.
    window.msRequestAnimationFrame // Pour Internet Explorer.az
//******************************************PERSONNAGE*****************************************************
var shinobi = { // OBJET PERSONNAGE 
  nom:'shinobi',
  vie:100,
  srcX:0,
  srcY:0,
  x:0,
  y:260,
  speed:40,
  left:false,
  right:false,
  attaque:false,
  defense:false,
  rows:7,
  cols:7,
  curFrame:0,
  frameCount:6
};
function majSpriteMouv (){ // FONCTION ANIMATION SPRITE COURRIR PERSONNAGE
 shinobi.curFrame = ++shinobi.curFrame % shinobi.frameCount;
 shinobi.srcY = (shinobi.curFrame + 1) * height;
}
function majSpriteAttaque (){ // FONCTION ANIMATION SPRITE ATTAQUE PERSONNAGE
  shinobi.curFrame = ++shinobi.curFrame % shinobi.frameCount;
  shinobi.srcY = (shinobi.curFrame + 1) * height;
}
function majFrameMouv (){ // FONCTION ANIMATION MOUVEMENT DU PERSONNAGE
  if (shinobi.left) {
    shinobi.srcX = 400;
    shinobi.x -= shinobi.speed; 
    majSpriteMouv();
  }
  if (shinobi.right) {
    shinobi.srcX = 0;
    shinobi.x += shinobi.speed;
    majSpriteMouv();
  }
};
     function majFrameAttaque (){ // FONCTION ANIMATION ATTAQUE DU PERSONNAGE
       if (shinobi.attaque == true && shinobi.left == false && shinobi.right == false) {    
         if (shinobi.derniereDirection == 'gauche') { 
          shinobi.srcX = 1200;
        }
        if (shinobi.derniereDirection == 'droite') { 
          shinobi.srcX = 800;
        }
        majSpriteAttaque()
      }
    };
function coupRecu (){ // FONCTION COUP RECU PERSONNAGE
 shinobi.srcX = 1600;
 shinobi.srcY = 400;
};
function defense (){ // FONCTION SPRITE DEFENSE PERSONNAGE
  if (shinobi.defense == true) { 
    evolBarreDefense();
    if (shinobi.derniereDirection == 'gauche') {
     shinobi.srcX = 2400;
     shinobi.srcY = 0;
   }
   if (shinobi.derniereDirection == 'droite') {
     shinobi.srcX = 2400;
     shinobi.srcY = 400;
   }
 } 
};
function vie (){ // FONCTION PERTE DE VIE DU PERSONNAGE
  if (monTableauEnnemis[i].collisionFight == true) {
    shinobi.vie = shinobi.vie - 5;
  }
if (shinobi.vie == 70) { // FONCTION DISPARITION DES MACARONS DE VIE DU PERSONNAGE
  $('.vie3').css({'display':'none'});
}
if (shinobi.vie == 30) {
 $('.vie1').css({'display':'none'});
}
if (shinobi.vie == 0) {
  $('.vie2').css({'display':'none'});
}
};
function evolBarreDefense (){ // FONCTION PERTE DE PV BARRE DE DEFENSE PERSONNAGE
  $('.barreDefense').width($('.barreDefense').width() - 5);
  if ($('.barreDefense').width() == 0) {
    shinobi.defense = false;
    if ($('.barreDefense').width() > 1) {
      shinobi.defense = true;
    }
  }
};
function retourBarreDefense (){ // FONCTION RECUPERATION DE PV BARRE DE DEFENSE PERSONNAGE
  $('.barreDefense').width($('.barreDefense').width() + 65);
  if ($('.barreDefense').width() >= 146) {
    $('.barreDefense').width(146)
  }
};
function evolBarreAttaque (){ // FONCTION PERTE DE PV BARRE DE ATTAQUE PERSONNAGE
  $('.barreAttaque').width($('.barreAttaque').width() - 5);
  if ($('.barreAttaque').width() == 0) {
    shinobi.attaque = false;
    if ($('.barreAttaque').width() > 1) {
      shinobi.attaque = true;
    }
  }
};
function retourBarreAttaque (){ // FONCTION RECUPERATION DE PV BARRE DE ATTAQUE PERSONNAGE
  $('.barreAttaque').width($('.barreAttaque').width() + 65);
  if ($('.barreAttaque').width() >= 146) {
    $('.barreAttaque').width(146)
  }
};
function limiteDeDeplacement(){
 if (shinobi.x < -50) {
  shinobi.x = shinobi.x +50
}
};
//******************************************SPRITE PERSONNAGE*****************************************************
var spriteWidth = 2800;
var spriteHeight = 2800;
// j'ai diviser la taille en H et W du sprite du personnage par le nombre de Cols et Rows pour obtenir la taille d'un seul mouvement
var width = spriteWidth/shinobi.cols;
var height = spriteHeight/shinobi.rows;
//******************************************ENNEMIS*****************************************************
var ConstructeurEnnemi= function(){ // FONCTION CONSTRUCTEUR ENNEMIS
  this.srcX = 400;
  this.srcY = 0;
  this.x = 950;
  this.y = 260;
  this.speed = 20;
  this.right = true;
  this.startEnnemiToucher = null;
  this.progressEnnemiToucher;
  this.collisionMouv = false;
  this.collisionFight = false;
  this.vie = 100;
  this.rows = 7;
  this.cols = 6;
  this.curFrame = 0;
  this.frameCount = 6;
  this.spriteEnnemiW = 2000;
  this.spriteEnnemiH = 2800;
  this.widthE = this.spriteEnnemiW/this.cols;
  this.heightE = this.spriteEnnemiH/this.rows;
  this.mouvSprite = function(){
    if (this.collisionMouv == true) {
      this.curFrame = ++this.curFrame % this.frameCount;
      this.srcY = (this.curFrame + 1) * this.heightE;
      if (this.right) { 
        this.x -= this.speed;
      }}
    },
    this.spriteAttaqueEnnemi = function(){
      if (this.collisionFight == true) {
        if (this.right) { 
          this.srcX = 1200;
        }
      }
    },
    this.coupRecu = function(){
      this.srcX = 1600;
      this.srcY = 0;
    },
    this.life = function(){
      this.vie = this.vie - 20;
    },
    this.limiteDeDeplacement = function(){
      if (this.x < -50) {
        this.x = this.x +50
      }
    },
//******************************************Collisions*****************************************************
this.collision = function(){ 
  // FONCTION DEFENSE DU PERSONNAGE QUAND L'ENNEMIS EST PROCHE DU PERSONNAGE ET QUE LE PERSONNAGE CE DEFEND L ENNEMI EST BLOQUER 
  if (shinobi.defense == true && this.x <= shinobi.x + 125 && shinobi.left == false && shinobi.right == false && shinobi.derniereDirection == 'droite'){
    this.collisionFight = false;
    this.collisionMouv = false;
    this.x = this.x + 50;
    this.coupRecu();
    evolBarreDefense();
  } else {
    this.collisionMouv = true;
    this.srcX = 400;
  }
  // FONCTION ATTAQUE DU PERSONNAGE QUAND L'ENNEMIS EST PROCHE DU PERSONNAGE ET QUE LE PERSONNAGE ATAQUE L ENNEMI RECULE ET PERD DE LA VIE  
  if (shinobi.attaque == true && this.x <= shinobi.x + 125 && shinobi.left == false && shinobi.right == false && shinobi.derniereDirection == 'droite') {
    this.collisionFight = false;
    this.collisionMouv = false;
    this.x = this.x + 100;
    explosion.controle = true;
    this.life();
    this.coupRecu();
    animExplosion();
    impactEnnemi();
  }else{
    this.collisionMouv = true;
    this.srcX = 400;
    explosion.controle = false;
  }
   // FONCTION ATTAQUE DE L ENNEMI QUAND L'ENNEMIS ATTAQUE ASSEZ PROCHE DU PERSONNAGE LE PERSONNAGE RECULE ET PERD DE LA VIE 
   if (this.x <= shinobi.x + 100){
    this.collisionFight = true;
    this.collisionMouv = true;
    this.limiteDeDeplacement();
    shinobi.left = false 
    shinobi.right = false
    shinobi.x = shinobi.x  - 100;
    coupRecu();
    vie();
    impactPerso();
    sonsSabreEnnemis();
    limiteDeDeplacement();
  } 
}
};
// CREATION DES ENNEMIS
var ennemi1 = new ConstructeurEnnemi;
var ennemi2 = new ConstructeurEnnemi;
var ennemi3 = new ConstructeurEnnemi;
var ennemi4 = new ConstructeurEnnemi;
var ennemi5 = new ConstructeurEnnemi;
var ennemi6 = new ConstructeurEnnemi;
var ennemi7 = new ConstructeurEnnemi;
var ennemi8 = new ConstructeurEnnemi;
var ennemi9 = new ConstructeurEnnemi;
var ennemi10 = new ConstructeurEnnemi;
// OBJET POUR EXPLOSION
var explosion = {
  srcX:0,
  srcY:0,
  x:0,
  y:220,
  width:122,
  controle:false,
  height:120
};
// FONCTION EXPLOSION 
function animExplosion(){
  if (explosion.controle == true) {
    explosion.srcX = explosion.srcX + 122;
    if (explosion.srcX == 610) {
      explosion.srcX = 0
    }
    explosion.x = monTableauEnnemis[i].x + 70;
    explosion.y = monTableauEnnemis[i].y + 140;
  } else {
   explosion.srcX = 0
 }
};
//******************************************CANVAS*****************************************************
// le canvas
var canvas = document.getElementById('canvasJeu');
//reglages de la taille du canvas
var canvasWidth = 1000;
var canvasHeight = 720;
canvas.width = canvasWidth;
canvas.height = canvasHeight;
// context du canvas
var ctx = canvas.getContext('2d');
//creation du Fond
var backgroundImage = new Image();
backgroundImage.src = 'assets/ninjaCv/decomposition/fond.jpg';
//creation de l'image du personnage
var personnage = new Image();
personnage.src = "assets/ninjaCv/sprite/sprite.png";
// creation images ennemis 
var ennemi01 = new Image();
ennemi01.src = "assets/ninjaCv/sprite/spriteEnnemi1.png"
var ennemi02 = new Image();
ennemi02.src = "assets/ninjaCv/sprite/spriteEnnemi2.png"
var ennemi03 = new Image();
ennemi03.src = "assets/ninjaCv/sprite/spriteEnnemi3.png"
var ennemi04 = new Image();
ennemi04.src = "assets/ninjaCv/sprite/spriteEnnemi4.png"
var ennemi05 = new Image();
ennemi05.src = "assets/ninjaCv/sprite/spriteEnnemi5.png"
var ennemi06 = new Image();
ennemi06.src = "assets/ninjaCv/sprite/spriteEnnemi6.png"
var ennemi07 = new Image();
ennemi07.src = "assets/ninjaCv/sprite/spriteEnnemi7.png"
var ennemi08 = new Image();
ennemi08.src = "assets/ninjaCv/sprite/spriteEnnemi8.png"
var ennemi09 = new Image();
ennemi09.src = "assets/ninjaCv/sprite/spriteEnnemi9.png"
var ennemi010 = new Image();
ennemi010.src = "assets/ninjaCv/sprite/spriteEnnemi10.png"
// affichage de l'explosion des ennemis
var explosion01 = new Image();
explosion01.src = "assets/ninjaCv/sprite/Explosion.png";
// affichage des logos competences
var logoCompetence = new Image();
logoCompetence.src = "assets/ninjaCv/sprite/spriteCompetence.png"
// TABLEAU DES ENNEMIS ET DES SPRITE DES ENNEMIS
var monTableauEnnemis = [ennemi1,ennemi2,ennemi3,ennemi4,ennemi5,ennemi6,ennemi7,ennemi8,ennemi9,ennemi10];
var monTableauImages = [ennemi01,ennemi02,ennemi03,ennemi04,ennemi05,ennemi06,ennemi07,ennemi08,ennemi09,ennemi010];
var i = 0;
var logoCompX = 510
// FONCTION QUI AJOUTE UN ENNEMIS A LA MORT DE L'ENNEMI PRECEDENT
function dieAndReload (){
  if (monTableauEnnemis[9].vie == 0) {
    youwin(); 
  }
  if (monTableauEnnemis[i].vie == 0) {
    i++;
    logoCompX = logoCompX - 51;
    explosion.controle = true;
    retourBarreDefense();
    retourBarreAttaque();
    // REMISE A ZERO DES ENNEMIS A L APPARITION D UN NOUVEAU
    monTableauEnnemis[i].vie = 100;
    monTableauEnnemis[i].x = 950;
    monTableauEnnemis[i].srcX = 400;
    monTableauEnnemis[i].srcY = 0;
    monTableauEnnemis[i].curFrame = 0;
    monTableauEnnemis[i].collisionFight = false;
    monTableauEnnemis[i].collisionMouv = false;
  }
  if (shinobi.vie == 0) {
    shinobi.srcX = 1600;
    shinobi.srcY = 2400;
    youlose();
  }
}
// FONCTION QUI DESSINE DANS LE CANVAS
function drawJeu(){
  ctx.drawImage(backgroundImage, 0, 100);
  ctx.drawImage(logoCompetence,logoCompX,0,720,72,320,195,720,72);
  ctx.drawImage(personnage,shinobi.srcX,shinobi.srcY,width,height,shinobi.x,shinobi.y,width,height);
  ctx.drawImage(monTableauImages[i],monTableauEnnemis[i].srcX,monTableauEnnemis[i].srcY,monTableauEnnemis[i].widthE,monTableauEnnemis[i].heightE,monTableauEnnemis[i].x,monTableauEnnemis[i].y,monTableauEnnemis[i].widthE,monTableauEnnemis[i].heightE);
  ctx.drawImage(explosion01,explosion.srcX,explosion.srcY,explosion.width,explosion.height,explosion.x,explosion.y,explosion.width,explosion.height);
};
//******************************************TIMESTAMP ET REQUEST ANIM*****************************************************
var start = null;
var time = function(timestamp){
  var progress;
  if (!monTableauEnnemis[i].startEnnemiToucher && monTableauEnnemis[i].collisionFight) {
    monTableauEnnemis[i].startEnnemiToucher = timestamp;
  }
  monTableauEnnemis[i].progressEnnemiToucher = timestamp - monTableauEnnemis[i].startEnnemiToucher;
  if (monTableauEnnemis[i].progressEnnemiToucher >= 90 && monTableauEnnemis[i].progressEnnemiToucher != timestamp) {
    monTableauEnnemis[i].spriteAttaqueEnnemi()
  }
  if (!start) {
    start = timestamp;
  }
  progress = timestamp - start;
  if (progress >= 90) {

    monTableauEnnemis[i].mouvSprite()
    monTableauEnnemis[i].collision()
    defense();
    majFrameMouv();
    majFrameAttaque();
    limiteDeDeplacement();
    dieAndReload();
    animExplosion();
    start = timestamp;
  }
  window.requestAnimationFrame(time);
};
// FONCTION QUI LANCE LE JEU
function gameLoop() {
  time();
  drawJeu();
  requestAnimationFrame(gameLoop);
}
function lancement(){
 gameLoop();
}
//******************************************controles*****************************************************
window.onkeydown = function(event){
  var code = event.keyCode;
  switch(code){
            case 39: // Touche droite enfoncée
            shinobi.right = true;
            shinobi.derniereDirection = 'droite';
            break;
            case 37: // Touche gauche enfoncée
            shinobi.left = true;
            shinobi.derniereDirection = 'gauche';
            break;
            case 38:
            shinobi.up = true;
            break;
            case 65: // touche a        
            shinobi.attaque = true;
            evolBarreAttaque();
            break;
            case 90: // touche z
            shinobi.defense = true;
            break;
          }
        };
        window.onkeyup = function(event){
          var code = event.keyCode;
          switch(code){
            case 39: // Touche droite relachée
            shinobi.right = false;
            shinobi.srcY = 0;
            break;
            case 37: // Touche gauche relachée
            shinobi.left = false
            shinobi.srcY = 0;
            break;
            case 38:
            shinobi.up = false;
            break;
            case 65: // touche space
            shinobi.attaque = false
            shinobi.srcY = 0;
            break
            case 90:
            shinobi.defense = false;
            break;
          }
        };


//******************************************controles*****************************************************

//******************************************Habillage*****************************************************
// sons 
var sonsLancer = false;
function sonsAmbiance(){
  var sourceUrlSonsJeu = 'assets/ninjaCv/audio/sonsJeu.mp3';
  $('#sons').attr('src',sourceUrlSonsJeu);
  $('#sons').attr('autoplay',true);
  $('#sons').attr('loop',true);
}
function sonsSabreEnnemis (){
 var sourceUrlSonsSabreEnnemis = 'assets/ninjaCv/audio/sabre.wav';
 $('#coupEnnemi').attr('src',sourceUrlSonsSabreEnnemis);
 $('#coupEnnemi').attr('autoplay',true);
}

function impactEnnemi (){
 var sourceUrlSonsImpactEnnemi = 'assets/ninjaCv/audio/impact.wav';
 $('#impact').attr('src',sourceUrlSonsImpactEnnemi);
 $('#impact').attr('autoplay',true);
}
function impactPerso (){
 var sourceUrlSonsImpactPerso = 'assets/ninjaCv/audio/impactPerso.wav';
 $('#impact').attr('src',sourceUrlSonsImpactPerso);
 $('#impact').attr('autoplay',true);
}
$('.imgLogoJoue').click(function(){
  lancement();
  //sonsAmbiance();
})
//bouton rejouer
$('.imgLogoJoueyl').click(function(){
  $('.vie1').css({'display':'inline'});
  $('.vie3').css({'display':'inline'});
  $('.vie2').css({'display':'inline'});
  $('.barreDefense').width(146);
  $('.barreAttaque').width(146);
  $('.youwin').css({display:'none'});
  $('.youlose').css({display:'none'});
  shinobi.x = 0;
  shinobi.vie = 100;
  shinobi.srcY = 0;
  shinobi.srcX = 0;
  i=0;
  monTableauEnnemis[i].vie = 100;
  monTableauEnnemis[i].x = 950;
  monTableauEnnemis[i].srcX = 400;
  monTableauEnnemis[i].srcY = 0;
  monTableauEnnemis[i].collisionFight = false;
  monTableauEnnemis[i].collisionMouv = false;
  logoCompX = 510;
  $('#canvas').show();
  $('.logoVie').show();
  lancement();
  sonsAmbiance();
  sonsLancer = false;
})
//Perdu
function youlose(){
  monTableauEnnemis[i].vie = 100;
  monTableauEnnemis[i].x = 950;
  monTableauEnnemis[i].srcX = 400;
  monTableauEnnemis[i].srcY = 0;
  $('.youlose').css({display:'block'});
  $('.youwin').css({display:'none'});
  $('.imgyl1').css({display:'block'});
  $('.imgyl2').css({display:'block'});
  $('.imgLogoJoueyl').css({display:'block'});
  $('.imgLogoCvyl').css({display:'block'});
}
// Gagner
function youwin(){
  monTableauEnnemis[i].vie = 100;
  monTableauEnnemis[i].x = 950;
  monTableauEnnemis[i].srcX = 400;
  monTableauEnnemis[i].srcY = 0;
  monTableauEnnemis[i].speed = 0;
  logoCompX = 0;
  $('.youlose').css({display:'none'});
  $('.youwin').css({display:'block'});
  $('.imgyl1').css({display:'block'});
  $('.imgyw2').css({display:'block'});
  $('.imgLogoJoueyl').css({display:'block'});
  $('.imgLogoCvyl').css({display:'block'});
}
});
