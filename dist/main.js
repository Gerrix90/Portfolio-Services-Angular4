(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./src/$$_lazy_route_resource lazy recursive":
/*!**********************************************************!*\
  !*** ./src/$$_lazy_route_resource lazy namespace object ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./src/$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/app.component.css":
/*!***********************************!*\
  !*** ./src/app/app.component.css ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\r\n.input{\r\n    margin-bottom: 500px;\r\n}\r\n\r\n.saveable{\r\n    background: red;\r\n}"

/***/ }),

/***/ "./src/app/app.component.html":
/*!************************************!*\
  !*** ./src/app/app.component.html ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<router-outlet></router-outlet>\r\n\r\n\r\n<!-- \r\n<input class=\"input\" defaultColor=\"yellow\" [appInputValids]=\"color\">\r\n<p style=\"color:white;\">The hero's birthday is {{ birthday | date:format | uppercase }}</p>\r\n  <button (click)=\"toggleFormat()\">Toggle Format</button>\r\n  <h2>Power Boost Calculator</h2>\r\n  <div>Normal power: <input [(ngModel)]=\"power\"></div>\r\n  <div>Boost factor: <input [(ngModel)]=\"factor\"></div>\r\n  <p>\r\n    Super Hero Power: {{power | exponentialStrength: factor}}\r\n  </p>\r\n-->"

/***/ }),

/***/ "./src/app/app.component.ts":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _providers_auth_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./providers/auth.service */ "./src/app/providers/auth.service.ts");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _angular_fire_auth__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/fire/auth */ "./node_modules/@angular/fire/auth/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var AppComponent = /** @class */ (function () {
    function AppComponent(authService, afAuth, router, _ActivatedRoute, location) {
        var _this = this;
        this.authService = authService;
        this.afAuth = afAuth;
        this.router = router;
        this._ActivatedRoute = _ActivatedRoute;
        this.location = location;
        this.user = this.authService.afAuth.authState;
        this.user.subscribe(function (auth) {
            if (auth) {
                _this.isLogged = true;
                _this.pseudo = auth.displayName;
                _this.email = auth.email;
                _this.router.navigate(['login']);
            }
            else {
                _this.isLogged = false;
                _this.pseudo = '';
                _this.email = '';
                _this.router.navigate(['home']);
            }
        });
    }
    AppComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-root',
            template: __webpack_require__(/*! ./app.component.html */ "./src/app/app.component.html"),
            styles: [__webpack_require__(/*! ./app.component.css */ "./src/app/app.component.css")]
        }),
        __metadata("design:paramtypes", [_providers_auth_service__WEBPACK_IMPORTED_MODULE_2__["AuthService"],
            _angular_fire_auth__WEBPACK_IMPORTED_MODULE_4__["AngularFireAuth"],
            _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"],
            _angular_router__WEBPACK_IMPORTED_MODULE_1__["ActivatedRoute"],
            _angular_common__WEBPACK_IMPORTED_MODULE_3__["Location"]])
    ], AppComponent);
    return AppComponent;
}());



/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/fesm5/platform-browser.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");
/* harmony import */ var _office_office_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./office/office.component */ "./src/app/office/office.component.ts");
/* harmony import */ var _nav_nav_module__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./nav/nav.module */ "./src/app/nav/nav.module.ts");
/* harmony import */ var _presentation_presentation_module__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./presentation/presentation.module */ "./src/app/presentation/presentation.module.ts");
/* harmony import */ var _skills_skills_module__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./skills/skills.module */ "./src/app/skills/skills.module.ts");
/* harmony import */ var _job_job_module__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./job/job.module */ "./src/app/job/job.module.ts");
/* harmony import */ var _exps_exps_module__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./exps/exps.module */ "./src/app/exps/exps.module.ts");
/* harmony import */ var _element_forms_element_forms_module__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./element-forms/element-forms.module */ "./src/app/element-forms/element-forms.module.ts");
/* harmony import */ var _element_forms_element_forms_service__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./element-forms/element-forms.service */ "./src/app/element-forms/element-forms.service.ts");
/* harmony import */ var _office_office_module__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./office/office.module */ "./src/app/office/office.module.ts");
/* harmony import */ var _footer_footer_component__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./footer/footer.component */ "./src/app/footer/footer.component.ts");
/* harmony import */ var _presentation_presentation_service__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./presentation/presentation.service */ "./src/app/presentation/presentation.service.ts");
/* harmony import */ var _scroll_back_button_scroll_back_button_component__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./scroll-back-button/scroll-back-button.component */ "./src/app/scroll-back-button/scroll-back-button.component.ts");
/* harmony import */ var _windowElement_window_element_service__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./windowElement/window-element.service */ "./src/app/windowElement/window-element.service.ts");
/* harmony import */ var _blotterService_blotter_service__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./blotterService/blotter.service */ "./src/app/blotterService/blotter.service.ts");
/* harmony import */ var _quotesService_quotes_service__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./quotesService/quotes.service */ "./src/app/quotesService/quotes.service.ts");
/* harmony import */ var _newsApi_news_api_component__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./newsApi/news-api.component */ "./src/app/newsApi/news-api.component.ts");
/* harmony import */ var _newsApi_news_api_service__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./newsApi/news-api.service */ "./src/app/newsApi/news-api.service.ts");
/* harmony import */ var _inputValids_input_valids_directive__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./inputValids/input-valids.directive */ "./src/app/inputValids/input-valids.directive.ts");
/* harmony import */ var _exponentielle_strength_pipe__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./exponentielle-strength.pipe */ "./src/app/exponentielle-strength.pipe.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ../environments/environment */ "./src/environments/environment.ts");
/* harmony import */ var _providers_auth_service__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./providers/auth.service */ "./src/app/providers/auth.service.ts");
/* harmony import */ var _app_routes__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./app.routes */ "./src/app/app.routes.ts");
/* harmony import */ var _home_home_component__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./home/home.component */ "./src/app/home/home.component.ts");
/* harmony import */ var _angular_fire__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! @angular/fire */ "./node_modules/@angular/fire/index.js");
/* harmony import */ var _angular_fire_database_deprecated__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! @angular/fire/database-deprecated */ "./node_modules/@angular/fire/database-deprecated/index.js");
/* harmony import */ var _angular_fire_auth__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! @angular/fire/auth */ "./node_modules/@angular/fire/auth/index.js");
/* harmony import */ var ngx_toasta__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ngx-toasta */ "./node_modules/ngx-toasta/fesm5/ngx-toasta.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

































var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            declarations: [
                _app_component__WEBPACK_IMPORTED_MODULE_5__["AppComponent"],
                _home_home_component__WEBPACK_IMPORTED_MODULE_28__["HomeComponent"],
                _office_office_component__WEBPACK_IMPORTED_MODULE_6__["OfficeComponent"],
                _inputValids_input_valids_directive__WEBPACK_IMPORTED_MODULE_23__["InputValidsDirective"],
                _exponentielle_strength_pipe__WEBPACK_IMPORTED_MODULE_24__["ExponentialStrengthPipe"],
                _footer_footer_component__WEBPACK_IMPORTED_MODULE_15__["FooterComponent"],
                _scroll_back_button_scroll_back_button_component__WEBPACK_IMPORTED_MODULE_17__["ScrollBackButtonComponent"],
                _newsApi_news_api_component__WEBPACK_IMPORTED_MODULE_21__["NewsApiComponent"]
            ],
            imports: [
                _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
                _nav_nav_module__WEBPACK_IMPORTED_MODULE_7__["NavModule"],
                _presentation_presentation_module__WEBPACK_IMPORTED_MODULE_8__["PresModule"],
                _skills_skills_module__WEBPACK_IMPORTED_MODULE_9__["SkillsModule"],
                _job_job_module__WEBPACK_IMPORTED_MODULE_10__["JobModule"],
                _exps_exps_module__WEBPACK_IMPORTED_MODULE_11__["ExpsModule"],
                _element_forms_element_forms_module__WEBPACK_IMPORTED_MODULE_12__["ElementFormsModule"],
                _office_office_module__WEBPACK_IMPORTED_MODULE_14__["officeModule"],
                _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClientModule"],
                _angular_fire__WEBPACK_IMPORTED_MODULE_29__["AngularFireModule"].initializeApp(_environments_environment__WEBPACK_IMPORTED_MODULE_25__["environment"].firebase),
                _angular_fire_database_deprecated__WEBPACK_IMPORTED_MODULE_30__["AngularFireDatabaseModule"],
                _angular_fire__WEBPACK_IMPORTED_MODULE_29__["AngularFireModule"],
                _angular_fire_auth__WEBPACK_IMPORTED_MODULE_31__["AngularFireAuthModule"],
                _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterModule"].forRoot(_app_routes__WEBPACK_IMPORTED_MODULE_27__["AppRoutes"]),
                _angular_forms__WEBPACK_IMPORTED_MODULE_4__["FormsModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_4__["ReactiveFormsModule"],
                ngx_toasta__WEBPACK_IMPORTED_MODULE_32__["ToastaModule"].forRoot()
            ],
            providers: [
                _providers_auth_service__WEBPACK_IMPORTED_MODULE_26__["AuthService"],
                _element_forms_element_forms_service__WEBPACK_IMPORTED_MODULE_13__["ElementFormsService"],
                _presentation_presentation_service__WEBPACK_IMPORTED_MODULE_16__["PresentationService"],
                _windowElement_window_element_service__WEBPACK_IMPORTED_MODULE_18__["WindowElementService"],
                _blotterService_blotter_service__WEBPACK_IMPORTED_MODULE_19__["BlotterService"],
                _quotesService_quotes_service__WEBPACK_IMPORTED_MODULE_20__["QuotesService"],
                _newsApi_news_api_service__WEBPACK_IMPORTED_MODULE_22__["NewsApiService"]
            ],
            bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_5__["AppComponent"]]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "./src/app/app.routes.ts":
/*!*******************************!*\
  !*** ./src/app/app.routes.ts ***!
  \*******************************/
/*! exports provided: AppRoutes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutes", function() { return AppRoutes; });
/* harmony import */ var _office_office_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./office/office.component */ "./src/app/office/office.component.ts");
/* harmony import */ var _home_home_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./home/home.component */ "./src/app/home/home.component.ts");


var AppRoutes = [
    { path: 'home', component: _home_home_component__WEBPACK_IMPORTED_MODULE_1__["HomeComponent"] },
    { path: 'login', component: _office_office_component__WEBPACK_IMPORTED_MODULE_0__["OfficeComponent"] }
];


/***/ }),

/***/ "./src/app/blotterService/blotter.service.ts":
/*!***************************************************!*\
  !*** ./src/app/blotterService/blotter.service.ts ***!
  \***************************************************/
/*! exports provided: BlotterService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BlotterService", function() { return BlotterService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var BlotterService = /** @class */ (function () {
    function BlotterService() {
        this.mainBlotterSliding = function (content, font, fontSize, fontColor, divisions, speed, direction) {
            var text = new Blotter.Text(content, {
                family: font,
                size: fontSize,
                fill: fontColor
            });
            var material = new Blotter.SlidingDoorMaterial();
            // setting numbers of text that separates the text
            // it is interger variable between 0.0 ~ any number
            material.uniforms.uDivisions.value = divisions;
            // setting speed for text movement
            // it is a float variable between 0.0 ~ 1.0
            material.uniforms.uSpeed.value = speed;
            // the text that appears will move from left to right or vice versa
            // is a boolean variable, filled with false or true
            material.uniforms.uAnimateHorizontal.value = direction;
            var blotter = new Blotter(material, { texts: text });
            var scope = blotter.forText(text);
            var container = document.getElementById('blotter');
            scope.appendTo(container);
        };
        this.mainBlotterSplit = function (content, font, fontSize, fontColor) {
            var text = new Blotter.Text(content, {
                family: font,
                size: fontSize,
                fill: fontColor
            });
            // here we will determine what material will be used
            var material = new Blotter.ChannelSplitMaterial();
            // add a supporting element for creating animations
            // here we add blur effect to the text
            material.uniforms.uApplyBlur.value = true;
            var blotter = new Blotter(material, { texts: text });
            var scope = blotter.forText(text);
            var container = document.getElementById('blotter');
            scope.appendTo(container);
        };
    }
    BlotterService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [])
    ], BlotterService);
    return BlotterService;
}());



/***/ }),

/***/ "./src/app/config/error_inputs.ts":
/*!****************************************!*\
  !*** ./src/app/config/error_inputs.ts ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var account_validation_messages = {
    'email': [
        { type: 'required', message: 'Votre email est obligatoire' },
        { type: 'pattern', message: 'Entrer un Email valide' }
    ],
    'username': [
        { type: 'required', message: 'Votre nom est obligatoire' },
        { type: 'minlength', message: 'Votre nom doit etre composé d\'un minimum de 5 caractères' },
        { type: 'maxlength', message: 'Votre nom ne doit pas depasser 25 caractères' },
        { type: 'pattern', message: 'Votre nom doit être composé de lettres et de chiffres' }
    ],
    'message': [
        { type: 'minlength', message: 'Votre messsage doit être composé d\'un minimum de 5 caractères' }
    ]
};
/* harmony default export */ __webpack_exports__["default"] = (account_validation_messages);


/***/ }),

/***/ "./src/app/config/labels.ts":
/*!**********************************!*\
  !*** ./src/app/config/labels.ts ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var labels = {
    'input': [
        {
            'email': 'Votre e-mail',
            'username': 'Votre pseudo / nom',
            'message': 'Votre message'
        }
    ]
};
/* harmony default export */ __webpack_exports__["default"] = (labels);


/***/ }),

/***/ "./src/app/element-forms/element-forms.component.css":
/*!***********************************************************!*\
  !*** ./src/app/element-forms/element-forms.component.css ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".app-element-forms-container{\r\n    background-color: white;\r\n    margin-top: 56px;\r\n}\r\n\r\n.app-element-forms-container .fa-compass{\r\n    font-size: 44px;\r\n    color: #6740B3;\r\n}\r\n\r\n.mdl-textfield__label{\r\n    color: white;\r\n}\r\n\r\n.app-element-forms-weather-container{\r\n    background-color: #6740B3;\r\n    padding: 20px;\r\n}\r\n\r\n.app-element-forms-weather-container div:first-child{\r\n    margin-top: 20px;\r\n}\r\n\r\n.app-element-forms-weather-container span{\r\n    font-family: 'Righteous', cursive;\r\n    color: white;\r\n    font-size: 28px;\r\n}\r\n\r\n.app-element-forms-weather-container i{\r\n    font-size: 145px;\r\n    color: white \r\n}\r\n\r\n@media screen and (max-width: 767px) {\r\n    .temperate-container{\r\n        border: none !important;   \r\n    }\r\n    .app-element-forms-weather-container{\r\n        margin-top: 10px;\r\n    }\r\n}\r\n\r\n.temperate-container{\r\n    font-size: 90px;\r\n    border-left: 2px solid white;   \r\n}\r\n\r\n.temperate-container p{\r\n\r\n    font-size: 16px;\r\n    color: white;\r\n    margin-top: 15px;\r\n    text-align: center;\r\n}\r\n\r\nform button{\r\n    margin-left: 10px;\r\n}\r\n\r\n.input-city-container{\r\n    width: 267px !important;\r\n}\r\n\r\n.weather-title{\r\n    margin-top: 50px;\r\n    color: #6740B3;\r\n    font-size: 50px;\r\n    text-align: center;\r\n    font-style: italic;\r\n    font-weight: bold;\r\n    text-shadow: \r\n        1px 1px 1px #d3d3d3,\r\n        1px 2px 1px #d3d3d3,\r\n        1px 3px 1px #d3d3d3,\r\n        1px 4px 1px #d3d3d3,\r\n        1px 5px 1px #d3d3d3,\r\n        1px 6px 1px #d3d3d3,\r\n        1px 7px 1px #d3d3d3,\r\n        0 1px 1px rgba(68,68,68,.3),\r\n        0 5px 3px rgba(68,68,68,.2),\r\n        0 10px 4px rgba(68,68,68,.2),\r\n        0 15px 8px rgba(68,68,68,.2),\r\n        0 30px 10px rgba(68,68,68,.1);\r\n}\r\n\r\n.weather-error-msg{\r\n    color: red;\r\n}\r\n\r\n\r\n\r\n"

/***/ }),

/***/ "./src/app/element-forms/element-forms.component.html":
/*!************************************************************!*\
  !*** ./src/app/element-forms/element-forms.component.html ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"row app-element-forms-container\">\r\n  <div class=\"col-xs-12 col-sm-5 col-md-5 col-lg-5\">\r\n    <h2 class=\"weather-title\">Météo du jour</h2>\r\n    <form #form=\"ngForm\" class=\"text-center\">\r\n      <div class=\"mdl-textfield mdl-js-textfield input-city-container\" [class.has-error]=\"msgSubject.invalid && msgSubject.touched\">\r\n        <div class=\"mdl-textfield mdl-js-textfield\">\r\n          <input class=\"mdl-textfield__input\" type=\"text\" id=\"sample6\" #msgSubject=\"ngModel\" ngModel name=\"msgSubject\">\r\n        </div>\r\n      </div>\r\n      <button (click)=\"sendPositionInputs(form)\" class=\"mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect\" [disabled]=\"form.invalid\">Chercher</button>\r\n<!--       <button (click)=\"getLocation()\" class=\"mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect\">\r\n        <i class=\"fa fa-compass\"></i>\r\n      </button> -->\r\n      <p class=\"weather-error-msg\" *ngIf=\"messageError\">Verifier l'ortographe de votre saisie</p>\r\n    </form>\r\n  </div>\r\n  <div class=\"col-xs-12 col-sm-7 col-md-7 col-lg-7\">\r\n    <div class=\"app-element-forms-weather-container text-center\">\r\n      <span>{{dataWeatherName ? dataWeatherName : 'Entrer votre ville'}}</span>\r\n      <div class=\"row animated flipInLeft\" *ngIf=\"dataWeatherName\">\r\n        <div class=\"col-xs-12 col-sm-6 col-md-6 col-lg-6\">\r\n          <i class=\"owi owi-{{iconUrl}}\"></i>\r\n        </div>\r\n        <div class=\"col-xs-12 col-sm-6 col-md-6 col-lg-6\">\r\n          <div class=\"temperate-container\" *ngIf=\"maxTemp && minTemp\">\r\n\r\n            <p>Temperature MIN :\r\n              <span>{{minTemp}}°</span>\r\n            </p>\r\n            <p>Temperature MAX :\r\n              <span>{{maxTemp}}°</span>\r\n            </p>\r\n            <p>Taux d'humidité :\r\n              <span>{{humidity}}%</span>\r\n            </p>\r\n            <p>Vitesse du vent :\r\n              <span>{{wind}} km/h</span>\r\n            </p>\r\n\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>"

/***/ }),

/***/ "./src/app/element-forms/element-forms.component.ts":
/*!**********************************************************!*\
  !*** ./src/app/element-forms/element-forms.component.ts ***!
  \**********************************************************/
/*! exports provided: ElementFormsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ElementFormsComponent", function() { return ElementFormsComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _element_forms_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./element-forms.service */ "./src/app/element-forms/element-forms.service.ts");
/* harmony import */ var _weatherApi_weather_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../weatherApi/weather.service */ "./src/app/weatherApi/weather.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var ElementFormsComponent = /** @class */ (function () {
    function ElementFormsComponent(_ElementFormsService, _WeatherService) {
        this._ElementFormsService = _ElementFormsService;
        this._WeatherService = _WeatherService;
        this.dataWeather = [];
        this.messageError = false;
        this.defaultPosition = "France";
    }
    ElementFormsComponent.prototype.ngOnInit = function () {
        this.getLocation();
    };
    ElementFormsComponent.prototype.sendPositionInputs = function (form) {
        var _this = this;
        console.log(form.value.msgSubject);
        this._WeatherService.getWeatherCurrent(form.value.msgSubject)
            .subscribe(function (res) {
            _this.addValueResponseWeatherService(res);
            _this.dataWeather = [];
        }, function (err) {
            _this.messageError = true;
            console.log(err + 'erreur ');
        });
    };
    ;
    ElementFormsComponent.prototype.postionByDefault = function () {
        var _this = this;
        this._WeatherService.getWeatherCurrent("France")
            .subscribe(function (res) {
            _this.addValueResponseWeatherService(res);
            _this.dataWeather = [];
        }, function (err) {
            _this.messageError = true;
            console.log(err + 'erreur ');
        });
    };
    ElementFormsComponent.prototype.getLocation = function () {
        if (navigator.geolocation) {
            var self = this;
            navigator.geolocation.getCurrentPosition(function (position) {
                self._WeatherService.getYourPosition(position.coords.latitude, position.coords.longitude)
                    .subscribe(function (res) {
                    self.dataWeather = res;
                    self.dataWeatherName = res.name;
                    self.iconUrl = res.weather[0].icon;
                    self.maxTemp = res.main.temp_max;
                    self.minTemp = res.main.temp_min;
                    self.humidity = res.main.humidity;
                    self.wind = res.wind.speed;
                    self.dataWeather = [];
                }, function (err) { return console.error(err + 'Error'); });
            });
        }
    };
    ;
    ElementFormsComponent.prototype.addValueResponseWeatherService = function (res) {
        this.dataWeather = res;
        this.dataWeatherName = res.name;
        this.iconUrl = res.weather[0].icon;
        this.maxTemp = res.main.temp_max;
        this.minTemp = res.main.temp_min;
        this.humidity = res.main.humidity;
        this.wind = res.wind.speed;
        this.messageError = false;
    };
    ElementFormsComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-element-forms',
            template: __webpack_require__(/*! ./element-forms.component.html */ "./src/app/element-forms/element-forms.component.html"),
            styles: [__webpack_require__(/*! ./element-forms.component.css */ "./src/app/element-forms/element-forms.component.css")]
        }),
        __metadata("design:paramtypes", [_element_forms_service__WEBPACK_IMPORTED_MODULE_1__["ElementFormsService"], _weatherApi_weather_service__WEBPACK_IMPORTED_MODULE_2__["WeatherService"]])
    ], ElementFormsComponent);
    return ElementFormsComponent;
}());

;


/***/ }),

/***/ "./src/app/element-forms/element-forms.module.ts":
/*!*******************************************************!*\
  !*** ./src/app/element-forms/element-forms.module.ts ***!
  \*******************************************************/
/*! exports provided: ElementFormsModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ElementFormsModule", function() { return ElementFormsModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _weatherApi_weather_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../weatherApi/weather.service */ "./src/app/weatherApi/weather.service.ts");
/* harmony import */ var _element_forms_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./element-forms.component */ "./src/app/element-forms/element-forms.component.ts");
/* harmony import */ var _element_forms_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./element-forms.service */ "./src/app/element-forms/element-forms.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};






var ElementFormsModule = /** @class */ (function () {
    function ElementFormsModule() {
    }
    ElementFormsModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormsModule"]],
            declarations: [_element_forms_component__WEBPACK_IMPORTED_MODULE_4__["ElementFormsComponent"]],
            exports: [_element_forms_component__WEBPACK_IMPORTED_MODULE_4__["ElementFormsComponent"]],
            providers: [_element_forms_service__WEBPACK_IMPORTED_MODULE_5__["ElementFormsService"], _weatherApi_weather_service__WEBPACK_IMPORTED_MODULE_3__["WeatherService"]]
        })
    ], ElementFormsModule);
    return ElementFormsModule;
}());



/***/ }),

/***/ "./src/app/element-forms/element-forms.service.ts":
/*!********************************************************!*\
  !*** ./src/app/element-forms/element-forms.service.ts ***!
  \********************************************************/
/*! exports provided: ElementFormsService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ElementFormsService", function() { return ElementFormsService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var ElementFormsService = /** @class */ (function () {
    function ElementFormsService(_http) {
        this._http = _http;
        this.httpOptions = {
            headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpHeaders"]({ 'Content-Type': 'application/json' })
        };
        this.postUrl = 'https://adrienleteinturier.herokuapp.com/action';
    }
    ElementFormsService.prototype.postContactForm = function (contactFormValue) {
        console.log('​ElementFormsService -> postContactForm -> contactFormValue', contactFormValue);
        this._http.post(this.postUrl, contactFormValue)
            .subscribe(function (data) {
            console.log(data);
        }, function (err) { return console.log(err, 'Erreur postContactForm)'); });
    };
    ElementFormsService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]])
    ], ElementFormsService);
    return ElementFormsService;
}());



/***/ }),

/***/ "./src/app/exponentielle-strength.pipe.ts":
/*!************************************************!*\
  !*** ./src/app/exponentielle-strength.pipe.ts ***!
  \************************************************/
/*! exports provided: ExponentialStrengthPipe */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ExponentialStrengthPipe", function() { return ExponentialStrengthPipe; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
var ExponentialStrengthPipe = /** @class */ (function () {
    function ExponentialStrengthPipe() {
    }
    ExponentialStrengthPipe.prototype.transform = function (value, exponent) {
        var exp = parseFloat(exponent);
        return Math.pow(value, isNaN(exp) ? 1 : exp);
    };
    ExponentialStrengthPipe = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Pipe"])({ name: 'exponentialStrength' })
    ], ExponentialStrengthPipe);
    return ExponentialStrengthPipe;
}());



/***/ }),

/***/ "./src/app/exps/exps.component.css":
/*!*****************************************!*\
  !*** ./src/app/exps/exps.component.css ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".app-exps-container{\r\n    background-color: white;\r\n    margin-top: 50px;\r\n    margin-left: 5px;\r\n    margin-right: 5px;\r\n}\r\n\r\n.app-exps-img-pastille{\r\n    background-color: #6639b6;\r\n    padding: 15px;\r\n    border-radius: 40px;\r\n}\r\n\r\n.app-exps-title-separate h2{\r\n    color: white;\r\n    font-size: 40px;\r\n    font-weight: bold;\r\n}\r\n\r\n.hr-custom-title{\r\n    background-color: white;\r\n    height: 3px;\r\n    width: 270px;\r\n    margin-top: 13px;\r\n}\r\n\r\n.app-exps-container-logo-exps div{\r\n    display: inline-block;\r\n    margin: 20px 5px 5px 5px;\r\n}\r\n\r\n.app-exps-container-logo-exps p{\r\n    font-family: 'Alfa Slab One', cursive;\r\n    color:#673AB7;\r\n    font-size: 18px;\r\n    margin-top: 10px;\r\n}\r\n\r\n.app-exps-container-logo-exps p:last-child{\r\n    font-size: 14px;\r\n    color:#c9c9c9;\r\n}\r\n\r\n@media screen and (max-width: 640px) {\r\n    .app-exps-container-logo-exps p{\r\n        font-size: 12px;\r\n    }\r\n    .app-exps-container-logo-exps p:last-child{\r\n        font-size: 12px;\r\n    }\r\n    .app-exps-title-separate h2{\r\n        font-size: 15px;\r\n    }\r\n  }\r\n"

/***/ }),

/***/ "./src/app/exps/exps.component.html":
/*!******************************************!*\
  !*** ./src/app/exps/exps.component.html ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"row\">\r\n    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n        <div class=\"app-exps-title-separate\">\r\n            <div class=\"rings\">\r\n                <h2>Jobs</h2>\r\n                <span><span></span></span>\r\n                <span><span></span></span>\r\n                <span><span></span></span>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n<div class=\"app-exps-container row\">\r\n    <div class=\"col-xs-4 col-sm-2 col-md-2 col-lg-2 mt-10\" *ngFor=\"let exp of exps\">\r\n        <div class=\"app-exps-container-logo-exps text-center\">\r\n            <div>\r\n                <img class=\"app-exps-img-pastille\" src=\"{{exp.logo}}\" alt=\"\">\r\n                <p>{{exp.title}}</p>\r\n                <p>{{exp.fonction}}</p>\r\n            </div>\r\n        </div>\r\n    </div>    \r\n</div>\r\n\r\n\r\n"

/***/ }),

/***/ "./src/app/exps/exps.component.ts":
/*!****************************************!*\
  !*** ./src/app/exps/exps.component.ts ***!
  \****************************************/
/*! exports provided: ExpsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ExpsComponent", function() { return ExpsComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _exps_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./exps.service */ "./src/app/exps/exps.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var ExpsComponent = /** @class */ (function () {
    function ExpsComponent(_expsService) {
        this._expsService = _expsService;
    }
    ExpsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._expsService.getExpFromAPIwithCache()
            .subscribe(function (res) { return _this.exps = res; }, function (err) { return console.error(err.status); });
    };
    ExpsComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            moduleId: module.i,
            selector: 'app-exps',
            template: __webpack_require__(/*! ./exps.component.html */ "./src/app/exps/exps.component.html"),
            styles: [__webpack_require__(/*! ./exps.component.css */ "./src/app/exps/exps.component.css")]
        }),
        __metadata("design:paramtypes", [_exps_service__WEBPACK_IMPORTED_MODULE_1__["ExpsService"]])
    ], ExpsComponent);
    return ExpsComponent;
}());



/***/ }),

/***/ "./src/app/exps/exps.module.ts":
/*!*************************************!*\
  !*** ./src/app/exps/exps.module.ts ***!
  \*************************************/
/*! exports provided: ExpsModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ExpsModule", function() { return ExpsModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _exps_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./exps.component */ "./src/app/exps/exps.component.ts");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/platform-browser/animations */ "./node_modules/@angular/platform-browser/fesm5/animations.js");
/* harmony import */ var _exps_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./exps.service */ "./src/app/exps/exps.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};





var ExpsModule = /** @class */ (function () {
    function ExpsModule() {
    }
    ExpsModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"], _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_3__["BrowserAnimationsModule"]],
            declarations: [_exps_component__WEBPACK_IMPORTED_MODULE_2__["ExpsComponent"]],
            exports: [_exps_component__WEBPACK_IMPORTED_MODULE_2__["ExpsComponent"]],
            providers: [_exps_service__WEBPACK_IMPORTED_MODULE_4__["ExpsService"]]
        })
    ], ExpsModule);
    return ExpsModule;
}());



/***/ }),

/***/ "./src/app/exps/exps.service.ts":
/*!**************************************!*\
  !*** ./src/app/exps/exps.service.ts ***!
  \**************************************/
/*! exports provided: ExpsService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ExpsService", function() { return ExpsService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var rxjs_add_operator_map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/add/operator/map */ "./node_modules/rxjs-compat/_esm5/add/operator/map.js");
/* harmony import */ var rxjs_add_operator_do__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/add/operator/do */ "./node_modules/rxjs-compat/_esm5/add/operator/do.js");
/* harmony import */ var rxjs_add_observable_throw__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/add/observable/throw */ "./node_modules/rxjs-compat/_esm5/add/observable/throw.js");
/* harmony import */ var rxjs_add_observable_of__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/add/observable/of */ "./node_modules/rxjs-compat/_esm5/add/observable/of.js");
/* harmony import */ var rxjs_add_operator_catch__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/add/operator/catch */ "./node_modules/rxjs-compat/_esm5/add/operator/catch.js");
/* harmony import */ var rxjs_internal_Observable__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/internal/Observable */ "./node_modules/rxjs/internal/Observable.js");
/* harmony import */ var rxjs_internal_Observable__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(rxjs_internal_Observable__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};








var ExpsService = /** @class */ (function () {
    function ExpsService(_http) {
        this._http = _http;
        this.url = '../assets/json/exps.json';
    }
    ExpsService.prototype.getExpFromAPIwithCache = function () {
        var _this = this;
        if (this.data) {
            return rxjs_internal_Observable__WEBPACK_IMPORTED_MODULE_6__["Observable"].of(this.data);
        }
        else if (this.observable) {
            return this.observable;
        }
        else {
            this.observable = this._http
                .get(this.url)
                .map(function (response) {
                _this.observable = null;
                _this.data = response;
                return _this.data;
            })
                .catch(function (error) {
                var errorMessage = "Une erreur " + error.status + " est survenue en tentant de joindre " + error.url;
                return rxjs_internal_Observable__WEBPACK_IMPORTED_MODULE_6__["Observable"].throw(errorMessage);
            });
            return this.observable;
        }
    };
    ExpsService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_7__["HttpClient"]])
    ], ExpsService);
    return ExpsService;
}());



/***/ }),

/***/ "./src/app/footer/footer.component.css":
/*!*********************************************!*\
  !*** ./src/app/footer/footer.component.css ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "h2{\r\n    font-family: 'Alfa Slab One', cursive;\r\n    color: #673AB7;\r\n}  \r\n\r\n.app-footer-container{\r\n    background-color: white;\r\n    padding-left: 20px;\r\n    padding-right: 20px;\r\n}  \r\n\r\n.form-group label{\r\n    cursor: pointer;\r\n    font-size: 13px;\r\n}  \r\n\r\n.app-footer-section-rigth{\r\n    background: #673AB6;\r\n    padding: 20px;\r\n}  \r\n\r\n.app-footer-section-center-socials{\r\n    background: url('shattered-island.gif');\r\n}  \r\n\r\n.app-footer-section-center-socials ul{\r\n    text-align: center;\r\n    list-style: none;\r\n    padding-top: 30px;\r\n    padding-bottom: 10px;\r\n    margin-bottom: 0px;\r\n    padding-left:0px;\r\n}  \r\n\r\n.app-footer-section-center-socials li{\r\n    padding-bottom: 5px;\r\n    position: relative;\r\n    top: 50%;\r\n}  \r\n\r\n.app-footer-section-center-socials li a{\r\n    font-size: 52px;\r\n    display:block;\r\n    transition: all 0.5s ease-out;\r\n    color: white;\r\n}  \r\n\r\n.app-footer-section-center-socials li a:hover{\r\n    -webkit-transform: rotate(60deg);\r\n            transform: rotate(60deg);\r\n    -webkit-transform: scale(1.5);\r\n            transform: scale(1.5);\r\n    color: #673AB6;\r\n}  \r\n\r\n.app-footer-section-right-map{\r\n    margin-top: 10px;\r\n}\r\n\r\n\r\n"

/***/ }),

/***/ "./src/app/footer/footer.component.html":
/*!**********************************************!*\
  !*** ./src/app/footer/footer.component.html ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"row app-title\">\r\n    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 text-center\">\r\n        <h1>Besoin d'un <span>Site Web</span> à votre image ou d'une visibilté sur les<span> Réseaux sociaux</span> ?</h1>\r\n    </div>\r\n</div>\r\n<div class=\"row app-footer-container\" >\r\n    <div class=\"col-xs-12 col-sm-5 col-md-5 col-lg-5 app-footer-section-left\">\r\n        <div id=\"blotter\"></div>\r\n        <form [formGroup]=\"accountDetailsForm\" novalidate (ngSubmit)=\"postMailMessage(accountDetailsForm.value)\" novalidate>\r\n            <div class=\"form-group\">\r\n                <label for=\"email\">{{labelInputs.email}}</label>\r\n                <input id=\"email\" type=\"email\" class=\"form-control\" placeholder=\"{{labelInputs.email}}\" formControlName=\"email\" required [class.input-has-error]=\"accountDetailsForm.get('email').invalid && accountDetailsForm.get('email').touched\">\r\n                <div *ngFor=\"let validation of validationConfig.email\">\r\n                    <small id=\"emailHelpId\" class=\"form-text text-muted\" [class.has-error]=\"accountDetailsForm.get('email').hasError(validation.type)\" *ngIf=\"accountDetailsForm.get('email').hasError(validation.type) && (accountDetailsForm.get('email').dirty || accountDetailsForm.get('email').touched) \">{{validation.message}}<i class=\"fas fa-exclamation-triangle has-error absolute-input-warning-ico\"></i></small>\r\n                </div>      \r\n            </div>\r\n            <div class=\"form-group\">\r\n                <label for=\"username\">{{labelInputs.username}}</label>\r\n                <input id=\"username\" type=\"username\" class=\"form-control\" placeholder=\"{{labelInputs.username}}\" formControlName=\"username\" required [class.input-has-error]=\"accountDetailsForm.get('username').invalid && accountDetailsForm.get('username').touched\">\r\n                <div *ngFor=\"let validation of validationConfig.username\">\r\n                    <small id=\"usernameHelpId\" class=\"form-text text-muted\" [class.has-error]=\"accountDetailsForm.get('username').hasError(validation.type)\" *ngIf=\"accountDetailsForm.get('username').hasError(validation.type) && (accountDetailsForm.get('username').dirty || accountDetailsForm.get('username').touched)\">{{validation.message}}<i class=\"fas fa-exclamation-triangle has-error absolute-input-warning-ico\"></i></small>\r\n                </div>               \r\n            </div>\r\n            <div class=\"form-group\">\r\n                <div *ngFor=\"let validation of validationConfig.message\">\r\n                <label for=\"message\">{{labelInputs.message}}</label>\r\n                    <textarea id=\"message\" type=\"message\" class=\"form-control\" placeholder=\"{{labelInputs.message}}\" formControlName=\"message\" [class.input-has-error]=\"accountDetailsForm.get('message').hasError(validation.type)\"></textarea>\r\n                    <small id=\"messageHelpId\" class=\"form-text text-muted\" [class.has-error]=\"accountDetailsForm.get('message').hasError(validation.type)\" *ngIf=\"accountDetailsForm.get('message').hasError(validation.type) && (accountDetailsForm.get('message').dirty || accountDetailsForm.get('message').touched)\">{{validation.message}}<i class=\"fas fa-exclamation-triangle has-error absolute-input-warning-ico\"></i></small>\r\n                </div>                \r\n            </div>    \r\n            <div class=\"row\">\r\n                <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 text-center\">\r\n                    <button class=\"mdl-button mdl-js-button mdl-button--raised\" type=\"submit\">Envoyer</button>\r\n                </div>\r\n            </div>                     \r\n        </form>\r\n    </div>\r\n    <div class=\"col-xs-12 col-sm-2 col-md-2 col-lg-2 app-footer-section-center\">\r\n        <div class=\"app-footer-section-center-socials\">\r\n            <ul>\r\n                <li *ngFor=\"let social of socials\">\r\n                    <a href=\"{{social.link}}\" title=\"{{social.title}}\"><i class=\"{{social.classIco}}\" aria-hidden=\"true\"></i></a>                    \r\n                </li>\r\n            </ul>\r\n        </div>\r\n    </div>\r\n    <div class=\"col-xs-12 col-sm-5 col-md-5 col-lg-5 app-footer-section-right\">\r\n        <div class=\"app-footer-section-right-map\">\r\n            <h2 class=\"opening text-center\">{{quotesContent}}</h2>\r\n            <cite>{{quotesTitle}}</cite>\r\n        </div>\r\n    </div>\r\n    <ngx-toasta [position]=\"'bottom-center'\"></ngx-toasta>\r\n</div> \r\n"

/***/ }),

/***/ "./src/app/footer/footer.component.ts":
/*!********************************************!*\
  !*** ./src/app/footer/footer.component.ts ***!
  \********************************************/
/*! exports provided: FooterComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FooterComponent", function() { return FooterComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _element_forms_element_forms_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../element-forms/element-forms.service */ "./src/app/element-forms/element-forms.service.ts");
/* harmony import */ var _presentation_presentation_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../presentation/presentation.service */ "./src/app/presentation/presentation.service.ts");
/* harmony import */ var _blotterService_blotter_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../blotterService/blotter.service */ "./src/app/blotterService/blotter.service.ts");
/* harmony import */ var _quotesService_quotes_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../quotesService/quotes.service */ "./src/app/quotesService/quotes.service.ts");
/* harmony import */ var _config_error_inputs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../config/error_inputs */ "./src/app/config/error_inputs.ts");
/* harmony import */ var _config_labels__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../config/labels */ "./src/app/config/labels.ts");
/* harmony import */ var ngx_toasta__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ngx-toasta */ "./node_modules/ngx-toasta/fesm5/ngx-toasta.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};









var FooterComponent = /** @class */ (function () {
    function FooterComponent(_elementFormService, fb, vcr, el, _PresentationService, _BlotterService, _QuotesService, toastaService, toastaConfig) {
        var _this = this;
        this._elementFormService = _elementFormService;
        this.fb = fb;
        this.el = el;
        this._PresentationService = _PresentationService;
        this._BlotterService = _BlotterService;
        this._QuotesService = _QuotesService;
        this.toastaService = toastaService;
        this.toastaConfig = toastaConfig;
        this.validationConfig = _config_error_inputs__WEBPACK_IMPORTED_MODULE_6__["default"];
        this.labelInputs = _config_labels__WEBPACK_IMPORTED_MODULE_7__["default"].input[0];
        this.postMailMessage = function (formValue, accountDetailsForm) {
            if (_this.accountDetailsForm.valid === true) {
                _this._elementFormService.postContactForm(formValue);
                _this.accountDetailsForm.reset('');
                _this.toastFc('succes', 'Votre message est envoyé');
            }
            else if (_this.accountDetailsForm.valid === false || _this.accountDetailsForm.value.username == "" || _this.accountDetailsForm.value.email == "") {
                _this.toastFc('error', 'Erreur !!! Votre message n\'a pas été envoyé, Vérifier votre saisie...');
            }
        };
        this.createForms = function () {
            // user links form validations
            _this.accountDetailsForm = _this.fb.group({
                username: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"]('', _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].compose([
                    _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].maxLength(25),
                    _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].minLength(5),
                    _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].pattern('^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$'),
                    _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].required
                ])),
                email: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"]('', _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].compose([
                    _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].required,
                    _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
                ])),
                message: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"]('', _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].compose([
                    _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].minLength(5)
                ]))
            });
        };
        this.toastFc = function (type, text) {
            switch (type) {
                case 'succes':
                    _this.toastaService.success(text);
                    break;
                case 'error':
                    _this.toastaService.error(text);
                    break;
                case 'warning':
                    _this.toastaService.warning(text);
                    break;
                case 'info':
                    _this.toastaService.info(text);
                    break;
            }
        };
        this.toastaConfig.theme = 'material';
    }
    FooterComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.createForms();
        this._PresentationService.getSocialsFromAPIwithCache()
            .subscribe(function (res) { return _this.socials = res; }, function (err) { return console.error(err.status); });
        this._BlotterService.mainBlotterSliding('Contactez-moi', 'Alfa Slab One, cursive', 45, '#673AB7', 8, 0.25, true);
        this._QuotesService.getQuotes()
            .subscribe(function (res) {
            _this.quotesContent = res[0]['content'].replace('<p>', '').replace('</p>', '').replace('<br />');
            _this.quotesTitle = res[0]['title'];
        }, function (err) { return console.error(err.status); });
    };
    FooterComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-footer',
            template: __webpack_require__(/*! ./footer.component.html */ "./src/app/footer/footer.component.html"),
            styles: [__webpack_require__(/*! ./footer.component.css */ "./src/app/footer/footer.component.css")]
        }),
        __metadata("design:paramtypes", [_element_forms_element_forms_service__WEBPACK_IMPORTED_MODULE_2__["ElementFormsService"],
            _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormBuilder"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"],
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"],
            _presentation_presentation_service__WEBPACK_IMPORTED_MODULE_3__["PresentationService"],
            _blotterService_blotter_service__WEBPACK_IMPORTED_MODULE_4__["BlotterService"],
            _quotesService_quotes_service__WEBPACK_IMPORTED_MODULE_5__["QuotesService"],
            ngx_toasta__WEBPACK_IMPORTED_MODULE_8__["ToastaService"],
            ngx_toasta__WEBPACK_IMPORTED_MODULE_8__["ToastaConfig"]])
    ], FooterComponent);
    return FooterComponent;
}());

;


/***/ }),

/***/ "./src/app/home/home.component.css":
/*!*****************************************!*\
  !*** ./src/app/home/home.component.css ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/home/home.component.html":
/*!******************************************!*\
  !*** ./src/app/home/home.component.html ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\r\n    <app-nav id=\"home\"></app-nav>\r\n    <app-pres></app-pres>\r\n    <app-skills id=\"skills\"></app-skills>\r\n    <app-job id=\"projects\"></app-job>\r\n    <app-exps id=\"jobs\"></app-exps>\r\n    <app-footer id=\"contact\"></app-footer>\r\n    <app-scroll-back-button bgColorButton=\"#6740B3\"></app-scroll-back-button>\r\n\r\n"

/***/ }),

/***/ "./src/app/home/home.component.ts":
/*!****************************************!*\
  !*** ./src/app/home/home.component.ts ***!
  \****************************************/
/*! exports provided: HomeComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HomeComponent", function() { return HomeComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var HomeComponent = /** @class */ (function () {
    function HomeComponent() {
    }
    HomeComponent.prototype.ngOnInit = function () {
        $('a[href^="#"]').click(function () {
            var id = $(this).attr("href");
            var offset = $(id).offset().top;
            $('html, body').animate({ scrollTop: offset }, 'slow');
            return false;
        });
    };
    HomeComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-home',
            template: __webpack_require__(/*! ./home.component.html */ "./src/app/home/home.component.html"),
            styles: [__webpack_require__(/*! ./home.component.css */ "./src/app/home/home.component.css")]
        }),
        __metadata("design:paramtypes", [])
    ], HomeComponent);
    return HomeComponent;
}());



/***/ }),

/***/ "./src/app/inputValids/input-valids.directive.ts":
/*!*******************************************************!*\
  !*** ./src/app/inputValids/input-valids.directive.ts ***!
  \*******************************************************/
/*! exports provided: InputValidsDirective */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InputValidsDirective", function() { return InputValidsDirective; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var InputValidsDirective = /** @class */ (function () {
    function InputValidsDirective(el) {
        this.el = el;
    }
    InputValidsDirective = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Directive"])({
            selector: '[appInputValids]'
        }),
        __metadata("design:paramtypes", [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"]])
    ], InputValidsDirective);
    return InputValidsDirective;
}());



/***/ }),

/***/ "./src/app/job/Job.component.css":
/*!***************************************!*\
  !*** ./src/app/job/Job.component.css ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".app-job{\r\n    margin-bottom: 30px;   \r\n}\r\n\r\n.app-job-content{\r\n    background-color: white;\r\n    padding: 20px;\r\n    margin-bottom: 50px;    \r\n    margin-top: 30px;\r\n    margin-left: 5px;\r\n    margin-right: 5px;\r\n    text-align: center;\r\n    border-radius: 3px;\r\n    font-family: 'Alfa Slab One', cursive;    \r\n    height: 100%;\r\n    cursor: pointer;\r\n    overflow: hidden;\r\n}\r\n\r\n.app-job-content span:first-child{\r\n    font-size: 19px;\r\n    color: black;\r\n}\r\n\r\n.app-job-content p{\r\n    font-family: 'Open Sans', sans-serif;\r\n    opacity: 0;\r\n    text-align: left;\r\n}\r\n\r\n.app-job-content-ico{\r\n    font-size: 30px;\r\n    margin-right: 5px;\r\n    color: #333;\r\n}\r\n\r\n.app-job-content-ico:hover{\r\n    font-size: 30px;\r\n    color: black;\r\n}\r\n\r\n.app-job-content-p-displayed{\r\n    opacity: 1 !important;\r\n    transition: opacity 2000ms ease-out; \r\n}\r\n\r\n.app-job-content-span{\r\n    color: white;\r\n}\r\n\r\n.app-job-content img{\r\n    opacity: 0;\r\n    width: 100%;\r\n}\r\n\r\n.app-job-img-displayed{\r\n    opacity: 1 !important;\r\n    width: 100%;    \r\n    transition: opacity 2000ms ease-out; \r\n}\r\n\r\n.app-job-techno > i{\r\n    color: white;\r\n    font-size: 40px;\r\n}\r\n\r\n.close {\r\n    position: absolute;\r\n    display: none;\r\n    margin-left: 5px;\r\n    right: 9px;\r\n    top: 32px;\r\n    width: 32px;\r\n    height: 32px;\r\n    opacity: 0.3;\r\n    z-index: 1;\r\n}\r\n\r\n.close-displayed{\r\n    display: block;\r\n}\r\n\r\n.close:hover {\r\n    opacity: 1;\r\n}\r\n\r\n.app-job-title-separate{\r\n    margin-top: 50px;\r\n}\r\n\r\n.app-job-title-separate h2{\r\n    color: white;\r\n    font-size: 40px;\r\n    font-weight: bold;\r\n}\r\n\r\n.hr-custom-title{\r\n    background-color: white;\r\n    height: 3px;\r\n    width: 270px;\r\n    margin-top: 13px;\r\n}\r\n\r\n@media screen and (max-width: 640px) {\r\n    .app-job-title-separate h2{\r\n        font-size: 15px;\r\n    }\r\n  }"

/***/ }),

/***/ "./src/app/job/Job.component.html":
/*!****************************************!*\
  !*** ./src/app/job/Job.component.html ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\r\n<div class=\"row\">\r\n    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 text-center\">\r\n        <div class=\"app-job-title-separate\">\r\n            <div class=\"rings\">\r\n                <h2>Web & Prints Projects</h2>\r\n                <span><span></span></span>\r\n                <span><span></span></span>\r\n                <span><span></span></span>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<div class=\"app-job\">\r\n    <div class=\"row\">\r\n        <div class=\"col-xs-12 col-sm-6 col-md-3 col-lg-3\" *ngFor=\"let job of jobs; trackBy let i=index\">\r\n            <div class=\"close\" (click)=\"outDisplay(job)\" [ngClass]=\"{'close-displayed': job.stateAnim == 'displayOk'}\">\r\n                <i class=\"fas fa-times\"></i>\r\n            </div>\r\n            <div class=\"app-job-content\" (click)=\"display(job)\" [@displayElement]=\"job.stateAnim\">\r\n                <div class=\"row\">\r\n                    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n                        <span [ngClass]=\"{'app-job-content-span': job.stateAnim == 'displayOk'}\">{{job.title}}</span>\r\n                        <p [ngClass]=\"{'app-job-content-p-displayed': job.stateAnim == 'displayOk'}\">{{job.description}}<br>\r\n                            <a *ngIf=\"job.iconGit == true\" href=\"{{job.gitLink}}\" title=\"Git-Hub\"> <i class=\"fab fa-github-square app-job-content-ico\" aria-hidden=\"true\"></i></a>\r\n                            <a *ngIf=\"job.viewProjet == true\" data-toggle=\"modal\" href=\"{{job.link}}\" [attr.data-target]=\"'#' + job.modalId\"><i class=\"fas fa-eye app-job-content-ico\"></i></a>  \r\n                        </p>\r\n                        \r\n                    </div>\r\n                    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n                        <img src={{job.logo}} alt=\"\" class=\"img-job app-job-img-displayed\">\r\n                    </div>\r\n                </div>\r\n                <hr>\r\n                <div class=\"app-job-techno\" *ngFor=\"let arrayJob of job.imgContent;\" >\r\n                    <i *ngIf=\"arrayJob.classIcon1\" class=\"{{arrayJob.classIcon1}}\"></i>\r\n                    <i *ngIf=\"arrayJob.classIcon2\" class=\"{{arrayJob.classIcon2}}\"></i>\r\n                    <i *ngIf=\"arrayJob.classIcon3\" class=\"{{arrayJob.classIcon3}}\"></i>\r\n                    <i *ngIf=\"arrayJob.classIcon4\" class=\"{{arrayJob.classIcon4}}\"></i>\r\n                    <i *ngIf=\"arrayJob.classIcon5\" class=\"{{arrayJob.classIcon5}}\"></i>\r\n                    <i *ngIf=\"arrayJob.classIcon6\" class=\"{{arrayJob.classIcon6}}\"></i>\r\n                    <i *ngIf=\"arrayJob.classIcon7\" class=\"{{arrayJob.classIcon7}}\"></i>\r\n                    <i *ngIf=\"arrayJob.classIcon8\" class=\"{{arrayJob.classIcon8}}\"></i>                                                                                                \r\n                </div>\r\n            </div>\r\n        </div>          \r\n    </div>\r\n    \r\n    <div class=\"row\">       \r\n        <div class=\"col-xs-12 col-sm-6 col-md-3 col-lg-3\" *ngFor=\"let print of prints; trackBy let i=index\">\r\n            <div class=\"close\" (click)=\"outDisplay2(print)\" [ngClass]=\"{'close-displayed': print.stateAnim == 'displayOk'}\">\r\n                <i class=\"fas fa-times\"></i>\r\n            </div>\r\n            <div class=\"app-job-content\" (click)=\"display2(print)\" [@displayElement]=\"print.stateAnim\">\r\n                <div class=\"row\">\r\n                    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n                        <span [ngClass]=\"{'app-job-content-span': print.stateAnim == 'displayOk'}\">{{print.title}}</span>\r\n                        <p [ngClass]=\"{'app-job-content-p-displayed': print.stateAnim == 'displayOk'}\">{{print.description}}<br>\r\n                            <a *ngIf=\"print.viewProjet == true\" data-toggle=\"modal\" href=\"{{print.link}}\" [attr.data-target]=\"'#' + print.modalId\"><i class=\"fa fa-eye app-job-content-ico\"></i></a>  \r\n                        </p>\r\n                        \r\n                    </div>\r\n                    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n                        <img src={{print.logo}} alt=\"\" class=\"img-job app-job-img-displayed\">\r\n                    </div>\r\n                </div>\r\n                <hr>\r\n                <div class=\"app-job-techno\" *ngFor=\"let arrayPrint of print.imgContent;\" >\r\n                    <i *ngIf=\"arrayPrint.classIcon1\" class=\"{{arrayPrint.classIcon1}}\"></i>\r\n                    <i *ngIf=\"arrayPrint.classIcon2\" class=\"{{arrayPrint.classIcon2}}\"></i>\r\n                    <i *ngIf=\"arrayPrint.classIcon3\" class=\"{{arrayPrint.classIcon3}}\"></i>\r\n                    <i *ngIf=\"arrayPrint.classIcon4\" class=\"{{arrayPrint.classIcon4}}\"></i>\r\n                    <i *ngIf=\"arrayPrint.classIcon5\" class=\"{{arrayPrint.classIcon5}}\"></i>\r\n                    <i *ngIf=\"arrayPrint.classIcon6\" class=\"{{arrayPrint.classIcon6}}\"></i>\r\n                    <i *ngIf=\"arrayPrint.classIcon7\" class=\"{{arrayPrint.classIcon7}}\"></i>\r\n                    <i *ngIf=\"arrayPrint.classIcon8\" class=\"{{arrayPrint.classIcon8}}\"></i>                                                                                                \r\n                </div>\r\n            </div>\r\n        </div>          \r\n    </div>    \r\n</div>\r\n\r\n<!-- Modal Write it social -->\r\n\r\n<div class=\"modal fade\" id=\"modalWriteItSocial\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\">\r\n    <div class=\"modal-dialog\" role=\"document\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header text-center\">\r\n                <img src=\"../assets/images/logoWriteItSocial.png\" alt=\"\" width=\"33%\">\r\n            </div>\r\n            <div class=\"modal-body\">\r\n                <video width=\"100%\" autoplay>\r\n                    <source\r\n                    src=\"../assets/videos/writeitsocial.webm\"\r\n                    type=\"video/webm\">\r\n                    <source\r\n                    src=\"../assets/videos/writeitsocial.mp4\"\r\n                    type=\"video/mp4\">\r\n                    <source\r\n                    src=\"../assets/videos/writeitsocial.mov\"\r\n                    type=\"video/mov\">\r\n                    Votre navigateur ne permet pas de lire les vidéos HTML5.\r\n                </video>\r\n            </div>\r\n            <div class=\"row\">\r\n                <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n                    <img src=\"../assets/images/mockup-write-it-social.png\" width=\"100%\" alt=\"Write it social\">\r\n                </div>\r\n            </div>\r\n            <div class=\"modal-footer\">\r\n                <button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">Fermer</button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n<app-modal [arrayModal]=\"prints\"></app-modal>\r\n"

/***/ }),

/***/ "./src/app/job/job.component.ts":
/*!**************************************!*\
  !*** ./src/app/job/job.component.ts ***!
  \**************************************/
/*! exports provided: JobComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "JobComponent", function() { return JobComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _job_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./job.service */ "./src/app/job/job.service.ts");
/* harmony import */ var _angular_animations__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/animations */ "./node_modules/@angular/animations/fesm5/animations.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var JobComponent = /** @class */ (function () {
    function JobComponent(_jobService) {
        this._jobService = _jobService;
    }
    JobComponent.prototype.ngOnInit = function () {
        this.callJobServiceFor();
    };
    JobComponent.prototype.callJobServiceFor = function () {
        var _this = this;
        this._jobService.getJobsFromAPIwithCache()
            .subscribe(function (res) { return _this.jobs = res; }, function (err) { return console.error(err.status); });
        this._jobService.getPrintsFromAPIwithCache()
            .subscribe(function (res) { return _this.prints = res; }, function (err) { return console.error(err.status); });
    };
    JobComponent.prototype.display = function (jobs) {
        jobs.stateAnim = 'displayOk';
    };
    JobComponent.prototype.outDisplay = function (jobs) {
        jobs.stateAnim = 'none';
    };
    JobComponent.prototype.display2 = function (prints) {
        prints.stateAnim = 'displayOk';
    };
    JobComponent.prototype.outDisplay2 = function (prints) {
        prints.stateAnim = 'none';
    };
    JobComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            moduleId: module.i,
            animations: [
                Object(_angular_animations__WEBPACK_IMPORTED_MODULE_2__["trigger"])('displayElement', [
                    Object(_angular_animations__WEBPACK_IMPORTED_MODULE_2__["state"])('none', Object(_angular_animations__WEBPACK_IMPORTED_MODULE_2__["style"])({
                        'height': '60px'
                    })),
                    Object(_angular_animations__WEBPACK_IMPORTED_MODULE_2__["state"])('displayOk', Object(_angular_animations__WEBPACK_IMPORTED_MODULE_2__["style"])({
                        'height': '90%',
                        'background': 'linear-gradient(135deg, #ffffff 30%,#6639b6 100%)' /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
                    })),
                    Object(_angular_animations__WEBPACK_IMPORTED_MODULE_2__["transition"])('none => displayOk', [
                        Object(_angular_animations__WEBPACK_IMPORTED_MODULE_2__["animate"])('1000ms cubic-bezier(0.6, -0.28, 0.735, 0.045)')
                    ]),
                    Object(_angular_animations__WEBPACK_IMPORTED_MODULE_2__["transition"])('displayOk => none', [
                        Object(_angular_animations__WEBPACK_IMPORTED_MODULE_2__["animate"])('500ms cubic-bezier(0.6, -0.28, 0.735, 0.045)')
                    ])
                ])
            ],
            selector: 'app-job',
            template: __webpack_require__(/*! ./Job.component.html */ "./src/app/job/Job.component.html"),
            styles: [__webpack_require__(/*! ./Job.component.css */ "./src/app/job/Job.component.css")]
        }),
        __metadata("design:paramtypes", [_job_service__WEBPACK_IMPORTED_MODULE_1__["JobService"]])
    ], JobComponent);
    return JobComponent;
}());



/***/ }),

/***/ "./src/app/job/job.module.ts":
/*!***********************************!*\
  !*** ./src/app/job/job.module.ts ***!
  \***********************************/
/*! exports provided: JobModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "JobModule", function() { return JobModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _job_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./job.component */ "./src/app/job/job.component.ts");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/platform-browser/animations */ "./node_modules/@angular/platform-browser/fesm5/animations.js");
/* harmony import */ var _job_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./job.service */ "./src/app/job/job.service.ts");
/* harmony import */ var _modals_modals_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../modals/modals.component */ "./src/app/modals/modals.component.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};






var JobModule = /** @class */ (function () {
    function JobModule() {
    }
    JobModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"], _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_3__["BrowserAnimationsModule"]],
            declarations: [_job_component__WEBPACK_IMPORTED_MODULE_2__["JobComponent"], _modals_modals_component__WEBPACK_IMPORTED_MODULE_5__["ModalComponent"]],
            exports: [_job_component__WEBPACK_IMPORTED_MODULE_2__["JobComponent"]],
            providers: [_job_service__WEBPACK_IMPORTED_MODULE_4__["JobService"]]
        })
    ], JobModule);
    return JobModule;
}());



/***/ }),

/***/ "./src/app/job/job.service.ts":
/*!************************************!*\
  !*** ./src/app/job/job.service.ts ***!
  \************************************/
/*! exports provided: JobService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "JobService", function() { return JobService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var rxjs_add_operator_map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/add/operator/map */ "./node_modules/rxjs-compat/_esm5/add/operator/map.js");
/* harmony import */ var rxjs_add_operator_do__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/add/operator/do */ "./node_modules/rxjs-compat/_esm5/add/operator/do.js");
/* harmony import */ var rxjs_add_observable_throw__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/add/observable/throw */ "./node_modules/rxjs-compat/_esm5/add/observable/throw.js");
/* harmony import */ var rxjs_add_observable_of__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/add/observable/of */ "./node_modules/rxjs-compat/_esm5/add/observable/of.js");
/* harmony import */ var rxjs_add_operator_catch__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/add/operator/catch */ "./node_modules/rxjs-compat/_esm5/add/operator/catch.js");
/* harmony import */ var rxjs_internal_Observable__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/internal/Observable */ "./node_modules/rxjs/internal/Observable.js");
/* harmony import */ var rxjs_internal_Observable__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(rxjs_internal_Observable__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};









var JobService = /** @class */ (function () {
    function JobService(_http) {
        this._http = _http;
        this.url = '../assets/json/jobs.json';
        this.url2 = '../assets/json/prints.json';
    }
    JobService.prototype.getJobsFromAPIwithCache = function () {
        var _this = this;
        if (this.data) {
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_8__["of"])(this.data);
        }
        else if (this.observable) {
            return this.observable;
        }
        else {
            this.observable = this._http
                .get(this.url)
                .map(function (response) {
                _this.observable = null;
                _this.data = response;
                return _this.data;
            })
                .catch(function (error) {
                var errorMessage = "Une erreur " + error.status + " est survenue en tentant de joindre " + error.url;
                return rxjs_internal_Observable__WEBPACK_IMPORTED_MODULE_6__["Observable"].throw(errorMessage);
            });
            return this.observable;
        }
    };
    JobService.prototype.getPrintsFromAPIwithCache = function () {
        var _this = this;
        if (this.data2) {
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_8__["of"])(this.data2);
        }
        else if (this.observable2) {
            return this.observable2;
        }
        else {
            this.observable2 = this._http
                .get(this.url2)
                .map(function (response) {
                _this.observable2 = null;
                _this.data2 = response;
                return _this.data2;
            })
                .catch(function (error) {
                var errorMessage = "Une erreur " + error.status + " est survenue en tentant de joindre " + error.url;
                return rxjs_internal_Observable__WEBPACK_IMPORTED_MODULE_6__["Observable"].throw(errorMessage);
            });
            return this.observable2;
        }
    };
    JobService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_7__["HttpClient"]])
    ], JobService);
    return JobService;
}());



/***/ }),

/***/ "./src/app/modals/modals.component.css":
/*!*********************************************!*\
  !*** ./src/app/modals/modals.component.css ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".img-modal-absolute{\r\n  height: 150px;\r\n  width: 110px !important;\r\n  position: absolute;\r\n  top: 10px;\r\n  border-radius: 5px;\r\n  right: 100px;\r\n}\r\n\r\n.img-modal-full{\r\n  width: 100%;\r\n}\r\n"

/***/ }),

/***/ "./src/app/modals/modals.component.html":
/*!**********************************************!*\
  !*** ./src/app/modals/modals.component.html ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div *ngFor=\"let printModal of arrayModal\">\r\n    <div class=\"modal fade\" id=\"{{printModal.modalId}}\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\">\r\n        <div class=\"modal-dialog\" role=\"document\">\r\n            <div class=\"modal-content\">\r\n                <div class=\"modal-header text-center\">\r\n                    <b>{{printModal.title}}</b>\r\n                </div>\r\n                <div class=\"modal-body\">\r\n                </div>\r\n                <div class=\"caroussel\" *ngIf=\"printModal.carouselActive\">\r\n                    <div id=\"carousel-example-generic\" class=\"carousel slide\" data-ride=\"carousel\">\r\n                        <!-- Indicators -->\r\n                        <ol class=\"carousel-indicators\">\r\n                            <li data-target=\"#carousel-example-generic\" data-slide-to=\"0\" class=\"active\"></li>\r\n                            <li data-target=\"#carousel-example-generic\" data-slide-to=\"1\"></li>\r\n                            <li data-target=\"#carousel-example-generic\" data-slide-to=\"2\"></li>\r\n                        </ol>\r\n\r\n                        <!-- Wrapper for slides -->\r\n                        <div class=\"carousel-inner\" role=\"listbox\">\r\n                            <div class=\"carousel-item active\">\r\n                                <img class=\"d-block img-fluid\" src=\"{{printModal.img[0]}}\" alt=\"{{printModal.title}}\">\r\n                            </div>\r\n                            <div class=\"carousel-item\">\r\n                                <img class=\"d-block img-fluid\" src=\"{{printModal.img[1]}}\" alt=\"{{printModal.title}}\">\r\n                            </div>\r\n                            <div class=\"carousel-item\">\r\n                                <img class=\"d-block img-fluid\" src=\"{{printModal.img[2]}}\" alt=\"{{printModal.title}}\">\r\n                            </div>\r\n                        </div>\r\n\r\n                        <!-- Controls -->\r\n                        <a class=\"left carousel-control\" href=\"#carousel-example-generic\" role=\"button\" data-slide=\"prev\">\r\n                            <span class=\"glyphicon glyphicon-chevron-left\" aria-hidden=\"true\"></span>\r\n                            <span class=\"sr-only\">Previous</span>\r\n                        </a>\r\n                        <a class=\"right carousel-control\" href=\"#carousel-example-generic\" role=\"button\" data-slide=\"next\">\r\n                            <span class=\"glyphicon glyphicon-chevron-right\" aria-hidden=\"true\"></span>\r\n                            <span class=\"sr-only\">Next</span>\r\n                        </a>\r\n                    </div>\r\n                </div>\r\n                <div class=\"row\" *ngIf=\"!printModal.carouselActive\">\r\n                    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n                        <img class=\"img-modal-full\" src=\"{{printModal.img[0]}}\" alt=\"{{printModal.title}}\">\r\n                        <img class=\"img-modal-absolute\" src=\"{{printModal.img[1]}}\" alt=\"{{printModal.title}}\">\r\n                        <img class=\"img-modal-absolute\" src=\"{{printModal.img[2]}}\" alt=\"{{printModal.title}}\" style=\"top:175px;\">\r\n                    </div>\r\n                </div>\r\n                <div class=\"modal-footer\">\r\n                    <button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">Fermer</button>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>"

/***/ }),

/***/ "./src/app/modals/modals.component.ts":
/*!********************************************!*\
  !*** ./src/app/modals/modals.component.ts ***!
  \********************************************/
/*! exports provided: ModalComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ModalComponent", function() { return ModalComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var ModalComponent = /** @class */ (function () {
    function ModalComponent() {
    }
    ModalComponent.prototype.ngOnInit = function () {
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], ModalComponent.prototype, "arrayModal", void 0);
    ModalComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-modal',
            template: __webpack_require__(/*! ./modals.component.html */ "./src/app/modals/modals.component.html"),
            styles: [__webpack_require__(/*! ./modals.component.css */ "./src/app/modals/modals.component.css")]
        })
    ], ModalComponent);
    return ModalComponent;
}());



/***/ }),

/***/ "./src/app/nav/nav.component.css":
/*!***************************************!*\
  !*** ./src/app/nav/nav.component.css ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".app-nav-link{\r\n    background-color: #1A1A1A !important;\r\n    font-size: 18px;\r\n}\r\n\r\n.app-nav-link a{\r\n    margin-left:20px;\r\n    padding-top: 10px;\r\n    padding-bottom: 10px;\r\n    text-decoration: none;\r\n    color: white;\r\n    cursor:pointer;    \r\n    transition: border-top 1s, border-bottom 1s, letter-spacing 1s;\r\n}\r\n\r\n.app-nav-link a:hover {\r\n    letter-spacing:4px;\r\n    color: white;\r\n    \r\n}\r\n\r\n.mdl-layout{\r\n    overflow: hidden;\r\n}"

/***/ }),

/***/ "./src/app/nav/nav.component.html":
/*!****************************************!*\
  !*** ./src/app/nav/nav.component.html ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\r\n  <div class=\" mdl-layout mdl-js-layout mdl-layout--fixed-header\">\r\n    <header class=\"mdl-layout__header app-nav-link\" >\r\n      <div class=\"mdl-layout__header-row\">\r\n        <!-- Title -->\r\n        <img src=\"assets/images/app-nav-logo.png\" alt=\"Logo\" width=\"50px\">\r\n        <span class=\"mdl-layout-title\">drien Leteinturier</span>\r\n        <!-- Add spacer, to align navigation to the right -->\r\n        <div class=\"mdl-layout-spacer\"></div>\r\n        <!-- Navigation. We hide it in small screens. -->\r\n        <nav class=\"mdl-navigation mdl-layout--large-screen-only\">\r\n          <a class=\"mdl-navigation__link\" (click)=\"login()\">Services</a>\r\n          <a class=\"mdl-navigation__link\" href=\"#projects\">Projects</a>\r\n          <a class=\"mdl-navigation__link\" href=\"#jobs\">Job Expériences</a>\r\n          <a class=\"mdl-navigation__link\" href=\"#contact\">Contact</a>\r\n        </nav>\r\n      </div>\r\n    </header>\r\n    <div class=\"mdl-layout__drawer mdl-layout--small-screen-only\">\r\n      <span class=\"mdl-layout-title\">Navigation</span>\r\n      <nav class=\"mdl-navigation\">\r\n          <a class=\"mdl-navigation__link\" (click)=\"login()\">Services</a>\r\n          <a class=\"mdl-navigation__link\" href=\"#projects\">Projects</a>\r\n          <a class=\"mdl-navigation__link\" href=\"#jobs\">Job Expériences</a>\r\n          <a class=\"mdl-navigation__link\" href=\"#contact\">Contact</a>\r\n      </nav>\r\n    </div>\r\n    <main class=\"mdl-layout__content\">\r\n      <div class=\"page-content\"><!-- Your content goes here --></div>\r\n    </main>\r\n  </div>  \r\n"

/***/ }),

/***/ "./src/app/nav/nav.component.ts":
/*!**************************************!*\
  !*** ./src/app/nav/nav.component.ts ***!
  \**************************************/
/*! exports provided: NavComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NavComponent", function() { return NavComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _providers_auth_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../providers/auth.service */ "./src/app/providers/auth.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var NavModele = /** @class */ (function () {
    function NavModele(url, title) {
        this.url = url;
        this.title = title;
    }
    return NavModele;
}());
var NavComponent = /** @class */ (function () {
    function NavComponent(authService, router, route) {
        this.authService = authService;
        this.router = router;
        this.route = route;
        this.array = [];
    }
    NavComponent.prototype.login = function () {
        this.authService.loginWithGoogle();
    };
    NavComponent.prototype.ngOnInit = function () {
        this.array = [
            /* new NavModele(null,'Services',this.login), */
            new NavModele('#projects', 'Projects'),
            new NavModele('#jobs', 'Job Expériences'),
            new NavModele('#contact', 'Contact'),
        ];
        this.sub = this.route
            .data
            .subscribe(function (value) { return console.log(value); });
    };
    NavComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            moduleId: module.i,
            selector: 'app-nav',
            template: __webpack_require__(/*! ./nav.component.html */ "./src/app/nav/nav.component.html"),
            styles: [__webpack_require__(/*! ./nav.component.css */ "./src/app/nav/nav.component.css")]
        }),
        __metadata("design:paramtypes", [_providers_auth_service__WEBPACK_IMPORTED_MODULE_2__["AuthService"], _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"], _angular_router__WEBPACK_IMPORTED_MODULE_1__["ActivatedRoute"]])
    ], NavComponent);
    return NavComponent;
}());



/***/ }),

/***/ "./src/app/nav/nav.module.ts":
/*!***********************************!*\
  !*** ./src/app/nav/nav.module.ts ***!
  \***********************************/
/*! exports provided: NavModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NavModule", function() { return NavModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _nav_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./nav.component */ "./src/app/nav/nav.component.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};



var NavModule = /** @class */ (function () {
    function NavModule() {
    }
    NavModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]],
            declarations: [_nav_component__WEBPACK_IMPORTED_MODULE_2__["NavComponent"]],
            exports: [_nav_component__WEBPACK_IMPORTED_MODULE_2__["NavComponent"]]
        })
    ], NavModule);
    return NavModule;
}());



/***/ }),

/***/ "./src/app/newsApi/news-api.component.css":
/*!************************************************!*\
  !*** ./src/app/newsApi/news-api.component.css ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".app-news-container {\r\n  margin-bottom: 50px;\r\n  margin-left: 17px;\r\n}\r\n\r\n.app-news-container h2 {\r\n  color: white;\r\n  font-family: 'Righteous', cursive;\r\n  font-weight: bold;\r\n}\r\n\r\n.app-news-img-container img {\r\n  width: 100%;\r\n  height: 500px;\r\n}\r\n\r\n.app-news-text {\r\n  height: 500px;\r\n  overflow: hidden;\r\n  overflow-y: scroll;\r\n}\r\n\r\n.app-news-text-container {\r\n  background-color: white;\r\n  border-radius: 5px;\r\n  padding: 10px;\r\n  margin-bottom: 5px;\r\n  transition: 1s;\r\n  margin-right: 5px;\r\n  cursor: pointer;\r\n}\r\n\r\n.app-news-text-container h3 {\r\n  font-family: 'Alfa Slab One', cursive;\r\n  color: #6740B3;\r\n  font-size: 20px;\r\n  line-height: 24px;\r\n  margin: 0;\r\n}\r\n\r\n.app-news-content-container {\r\n  font-family: 'Righteous', cursive;\r\n  margin-bottom: 20px;\r\n  font-size: 18px;\r\n  background-color: white;\r\n  padding: 20px;\r\n  color: white;\r\n  margin-right: 17px;\r\n  background-color: #6740B3;\r\n}\r\n\r\n.app-news-content-container a {\r\n  color: rgb(255, 64, 129);\r\n  font-size: 14px;\r\n  transition: 2s;\r\n}\r\n\r\n.app-news-content-container a:hover {\r\n  color: lightblue;\r\n  font-size: 16px;\r\n}\r\n\r\n.app-news-spinner-img {\r\n  position: absolute;\r\n  z-index: 1;\r\n  /* top: 153px; */\r\n  bottom: -60px;\r\n  left: 29%;\r\n}\r\n\r\n.app-news-button-src {\r\n  margin-bottom: 10px;\r\n}\r\n\r\n.app-news-button-src button {\r\n  background-color: #6740B3;\r\n  color: white;\r\n  margin-bottom: 5px;\r\n}\r\n\r\n.app-news-button-src button.current {\r\n  background-color: rgb(255, 64, 129);\r\n}\r\n\r\n.app-news-text-container.active {\r\n  background-color: #6740B3;\r\n}\r\n\r\n.app-news-text-container h3.active {\r\n  color: white;\r\n}\r\n\r\n@media screen and (max-width: 640px) {\r\n  .app-news-content-container {\r\n    margin-right: 0px;\r\n  }\r\n\r\n  .app-news-container {\r\n    margin-left: 0px;\r\n  }\r\n\r\n  .app-news-img-container img {\r\n    height: auto;\r\n  }\r\n\r\n  .app-news-text {\r\n    margin-left: 15px;\r\n  }\r\n\r\n  .app-news-img-container {\r\n    margin-bottom: 10px;\r\n  }\r\n\r\n  .app-news-text {\r\n    height: 300px;\r\n  }\r\n\r\n}\r\n"

/***/ }),

/***/ "./src/app/newsApi/news-api.component.html":
/*!*************************************************!*\
  !*** ./src/app/newsApi/news-api.component.html ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"app-news-container\">\r\n  <div class=\"row\">\r\n    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n      <h2 class=\"text-center\">Live News by\r\n        <a href=\"https://newsapi.org/\">NewsApi</a>\r\n      </h2>\r\n    </div>\r\n  </div>\r\n  <div class=\"row app-news-button-src text-center\">\r\n    <div class=\"col-xs-6 col-sm-4 col-md-4 col-lg-2\">\r\n      <button (click)=\"sendNewsDataGeneral()\" class=\"mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect\">\r\n        Générale\r\n      </button>\r\n    </div>\r\n    <div class=\"col-xs-6 col-sm-4 col-md-4 col-lg-2\">\r\n      <button (click)=\"sendNewsDataEntertainment()\"\r\n      class=\"mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect\">Divertissement\r\n    </button>\r\n  </div>\r\n  <div class=\"col-xs-6 col-sm-4 col-md-4 col-lg-2\">\r\n    <button (click)=\"sendNewsDataHealth()\" class=\"mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect\">\r\n      Santé\r\n    </button>\r\n  </div>\r\n  <div class=\"col-xs-6 col-sm-4 col-md-4 col-lg-2\">\r\n    <button (click)=\"sendNewsDataScience()\" class=\"mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect\">\r\n      Sciences\r\n    </button>\r\n  </div>\r\n  <div class=\"col-xs-6 col-sm-4 col-md-4 col-lg-2\">\r\n    <button (click)=\"sendNewsDataSports()\" class=\"mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect\">\r\n      Sports\r\n    </button>\r\n  </div>\r\n  <div class=\"col-xs-6 col-sm-4 col-md-4 col-lg-2\">\r\n    <button (click)=\"sendNewsDataTechnology()\"\r\n    class=\"mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect\">La technologie\r\n  </button>\r\n</div>\r\n</div>\r\n<div class=\"row\">\r\n  <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n    <div class=\"row\">\r\n      <div class=\"col-xs-12 col-sm-6 col-md-8 col-lg-8\">\r\n        <div class=\"app-news-img-container\">\r\n          <img src=\"{{imgNews == null ? noImg : imgNews}}\">\r\n        </div>\r\n      </div>\r\n      <div class=\"col-xs-12 col-sm-6 col-md-4 col-lg-4 app-news-text text-center no-padding-left\">\r\n        <div class=\"app-news-text-container\" *ngFor=\"let dataNew of dataNews; let i=index\" [ngClass]=\"{active: isSelectedItem(dataNew, dataNew.id) }\" (click)=\"selectedSrcData(i); selectedStyle(dataNew)\"\r\n        (mouseleave)=\"imgClass = false\">\r\n        <h3 [ngClass]=\"{active: isSelectedItem(dataNew, dataNew.id) }\">{{dataNew.title}}</h3>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <div class=\"row\">\r\n    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\r\n      <div class=\"app-news-content-container\">\r\n        <span>{{contentNews}}</span>\r\n        <a href=\"{{authorNewsLink}}\" target=\"_blank\">\r\n          <cite>{{authorNews === null ? srcName : authorNews}}</cite>\r\n        </a>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n</div>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/newsApi/news-api.component.ts":
/*!***********************************************!*\
  !*** ./src/app/newsApi/news-api.component.ts ***!
  \***********************************************/
/*! exports provided: NewsApiComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NewsApiComponent", function() { return NewsApiComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _news_api_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./news-api.service */ "./src/app/newsApi/news-api.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var NewsApiComponent = /** @class */ (function () {
    function NewsApiComponent(_NewsApiService, myElement) {
        this._NewsApiService = _NewsApiService;
        this.myElement = myElement;
        this.dataNews = [];
        this.imgClass = false;
        this.activeOnglet = false;
        this.noImg = '../../assets/images/dummy_600x400_ffffff_cccccc_no-image-.png';
    }
    NewsApiComponent.prototype.ngOnInit = function () {
        this.sendNewsDataGeneral();
        this.changeColorButtonSection();
    };
    NewsApiComponent.prototype.selectedStyle = function (item, id) {
        this.dataNews[id] = item;
    };
    NewsApiComponent.prototype.isSelectedItem = function (item, id) {
        return this.dataNews[id] && this.dataNews[id] === item;
    };
    ;
    NewsApiComponent.prototype.sendNewsDataGeneral = function () {
        var _this = this;
        this._NewsApiService.getNewsGeneral()
            .subscribe(function (res) {
            _this.addResHttpValueFirst(res);
        }, function (err) {
            console.log(err + 'Erreur de chargement categorie General');
        });
    };
    ;
    NewsApiComponent.prototype.sendNewsDataEntertainment = function () {
        var _this = this;
        this._NewsApiService.getNewsEntertainment()
            .subscribe(function (res) {
            _this.addResHttpValueFirst(res);
        }, function (err) {
            console.log(err + 'Erreur de chargement categorie Divertissement');
        });
    };
    ;
    NewsApiComponent.prototype.sendNewsDataHealth = function () {
        var _this = this;
        this._NewsApiService.getNewsHealth()
            .subscribe(function (res) {
            _this.addResHttpValueFirst(res);
        }, function (err) {
            console.log(err + 'Erreur de chargement categorie Santé');
        });
    };
    ;
    NewsApiComponent.prototype.sendNewsDataScience = function () {
        var _this = this;
        this._NewsApiService.getNewsScience()
            .subscribe(function (res) {
            _this.addResHttpValueFirst(res);
        }, function (err) {
            console.log(err + 'Erreur de chargement categorie Science');
        });
    };
    ;
    NewsApiComponent.prototype.sendNewsDataSports = function () {
        var _this = this;
        this._NewsApiService.getNewsSports()
            .subscribe(function (res) {
            _this.addResHttpValueFirst(res);
        }, function (err) {
            console.log(err + 'Erreur de chargement categorie Sports');
        });
    };
    ;
    NewsApiComponent.prototype.sendNewsDataTechnology = function () {
        var _this = this;
        this._NewsApiService.getNewsTechnology()
            .subscribe(function (res) {
            _this.addResHttpValueFirst(res);
        }, function (err) {
            console.log(err + 'Erreur de chargement categorie Technologie');
        });
    };
    ;
    NewsApiComponent.prototype.selectedSrcData = function (element) {
        this.selectSrcDataItem(element);
    };
    NewsApiComponent.prototype.selectSrcDataItem = function (element) {
        this.imgNews = this.dataNews[element].urlToImage;
        this.contentNews = this.dataNews[element].description;
        this.authorNews = this.dataNews[element].author;
        this.authorNewsLink = this.dataNews[element].url;
        this.srcName = this.dataNews[element].source.name;
        this.imgClass = true;
    };
    NewsApiComponent.prototype.addResHttpValueFirst = function (res) {
        this.dataNews = res.articles;
        this.imgNews = res.articles[0].urlToImage;
        this.contentNews = res.articles[0].description;
        this.authorNews = res.articles[0].author;
        this.authorNewsLink = res.articles[0].url;
        this.srcName = res.articles[0].source.name;
    };
    NewsApiComponent.prototype.changeColorButtonSection = function () {
        $('.app-news-button-src button').click(function () {
            $('.current').removeClass('current');
            $(this).addClass('current');
        });
    };
    NewsApiComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-news-api',
            template: __webpack_require__(/*! ./news-api.component.html */ "./src/app/newsApi/news-api.component.html"),
            styles: [__webpack_require__(/*! ./news-api.component.css */ "./src/app/newsApi/news-api.component.css")]
        }),
        __metadata("design:paramtypes", [_news_api_service__WEBPACK_IMPORTED_MODULE_1__["NewsApiService"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"]])
    ], NewsApiComponent);
    return NewsApiComponent;
}());



/***/ }),

/***/ "./src/app/newsApi/news-api.service.ts":
/*!*********************************************!*\
  !*** ./src/app/newsApi/news-api.service.ts ***!
  \*********************************************/
/*! exports provided: NewsApiService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NewsApiService", function() { return NewsApiService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../environments/environment */ "./src/environments/environment.ts");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var NewsApiService = /** @class */ (function () {
    function NewsApiService(_http) {
        this._http = _http;
    }
    NewsApiService.prototype.getNewsGeneral = function () {
        return this._http.get("https://newsapi.org/v2/top-headlines?country=fr&apiKey=" + _environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].newsApi.apiKeys) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
            .map(function (data1) { return data1; })
            .do(function (x) { return console.log(x); });
    };
    NewsApiService.prototype.getNewsEntertainment = function () {
        return this._http.get("https://newsapi.org/v2/top-headlines?country=fr&category=entertainment&apiKey=" + _environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].newsApi.apiKeys) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
            .map(function (data1) { return data1; })
            .do(function (x) { return console.log(x); });
    };
    NewsApiService.prototype.getNewsHealth = function () {
        return this._http.get("https://newsapi.org/v2/top-headlines?country=fr&category=health&apiKey=" + _environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].newsApi.apiKeys) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
            .map(function (data1) { return data1; })
            .do(function (x) { return console.log(x); });
    };
    NewsApiService.prototype.getNewsScience = function () {
        return this._http.get("https://newsapi.org/v2/top-headlines?country=fr&category=science&apiKey=" + _environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].newsApi.apiKeys) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
            .map(function (data1) { return data1; })
            .do(function (x) { return console.log(x); });
    };
    NewsApiService.prototype.getNewsSports = function () {
        return this._http.get("https://newsapi.org/v2/top-headlines?country=fr&category=sports&apiKey=" + _environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].newsApi.apiKeys) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
            .map(function (data1) { return data1; })
            .do(function (x) { return console.log(x); });
    };
    NewsApiService.prototype.getNewsTechnology = function () {
        return this._http.get("https://newsapi.org/v2/top-headlines?country=fr&category=technology&apiKey=" + _environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].newsApi.apiKeys) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
            .map(function (data1) { return data1; })
            .do(function (x) { return console.log(x); });
    };
    NewsApiService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"]])
    ], NewsApiService);
    return NewsApiService;
}());



/***/ }),

/***/ "./src/app/office/office.component.css":
/*!*********************************************!*\
  !*** ./src/app/office/office.component.css ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".app-office-img-profil{\r\n    width: 50px;\r\n    border-radius: 20px;\r\n    margin-right: 20px;\r\n}\r\napp-element-form{\r\n    padding-top: 150px;\r\n}\r\n.mdl-layout-title span:last-child{\r\n    font-size: 24px;\r\n    font-family: 'Righteous', cursive;\r\n}\r\n@media screen and (max-width: 640px) {\r\n    .mdl-layout-title span:first-child{\r\n        display: none;\r\n    }\r\n}"

/***/ }),

/***/ "./src/app/office/office.component.html":
/*!**********************************************!*\
  !*** ./src/app/office/office.component.html ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\" mdl-layout mdl-js-layout mdl-layout--fixed-header\">\r\n  <header class=\"mdl-layout__header app-nav-link\">\r\n    <div class=\"mdl-layout__header-row\">\r\n      <img class=\"app-office-img-profil\" src=\"{{photoUrl}}\" alt=\"Image profil : {{pseudo}}\">\r\n      <span class=\"mdl-layout-title\">\r\n        <span>Bienvenue</span>\r\n        <span>{{pseudo}}</span>\r\n      </span>\r\n      <div class=\"mdl-layout-spacer\"></div>\r\n      <nav class=\"mdl-navigation mdl-layout--large-screen-only\">\r\n        <a class=\"mdl-navigation__link\" (click)=\"logout()\">Se déconnecter</a>\r\n      </nav>\r\n    </div>\r\n  </header>\r\n  <div class=\"mdl-layout__drawer mdl-layout--small-screen-only\">\r\n    <span class=\"mdl-layout-title\">Navigation</span>\r\n    <nav class=\"mdl-navigation\">\r\n      <a class=\"mdl-navigation__link\" (click)=\"logout()\">Se déconnecter</a>\r\n    </nav>\r\n  </div>\r\n  <main class=\"mdl-layout__content\">\r\n    <div class=\"page-content\">\r\n      <app-element-forms></app-element-forms>\r\n      <app-news-api></app-news-api>\r\n    </div>\r\n  </main>\r\n</div>"

/***/ }),

/***/ "./src/app/office/office.component.ts":
/*!********************************************!*\
  !*** ./src/app/office/office.component.ts ***!
  \********************************************/
/*! exports provided: OfficeComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OfficeComponent", function() { return OfficeComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _providers_auth_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../providers/auth.service */ "./src/app/providers/auth.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var OfficeComponent = /** @class */ (function () {
    function OfficeComponent(authService, router) {
        var _this = this;
        this.authService = authService;
        this.router = router;
        this.user = this.authService.afAuth.authState;
        this.user.subscribe(function (auth) {
            _this.addValueAuth(auth);
        });
    }
    ;
    OfficeComponent.prototype.addValueAuth = function (auth) {
        if (auth) {
            this.pseudo = auth.displayName;
            this.email = auth.email;
            this.photoUrl = auth.photoURL;
        }
    };
    OfficeComponent.prototype.ngOnInit = function () {
    };
    OfficeComponent.prototype.logout = function () {
        this.authService.logout();
        window.location.href = '/';
    };
    OfficeComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'office',
            template: __webpack_require__(/*! ./office.component.html */ "./src/app/office/office.component.html"),
            styles: [__webpack_require__(/*! ./office.component.css */ "./src/app/office/office.component.css")]
        }),
        __metadata("design:paramtypes", [_providers_auth_service__WEBPACK_IMPORTED_MODULE_2__["AuthService"], _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]])
    ], OfficeComponent);
    return OfficeComponent;
}());



/***/ }),

/***/ "./src/app/office/office.module.ts":
/*!*****************************************!*\
  !*** ./src/app/office/office.module.ts ***!
  \*****************************************/
/*! exports provided: officeModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "officeModule", function() { return officeModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


var officeModule = /** @class */ (function () {
    function officeModule() {
    }
    officeModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]],
            declarations: [],
            exports: [],
            providers: []
        })
    ], officeModule);
    return officeModule;
}());



/***/ }),

/***/ "./src/app/presentation/presentation.component.css":
/*!*********************************************************!*\
  !*** ./src/app/presentation/presentation.component.css ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".mdl-card{\r\n    width: 100%;\r\n}\r\n.app-pres {\r\n    background-image: url('img-pres.jpg');\r\n    background-size: cover;\r\n    background-repeat: no-repeat;\r\n    padding-top: 150px;\r\n    background-position: center;\r\n}\r\n.app-pres-logo {\r\n    \r\n/* Permalink - use to edit and share this gradient: http://colorzilla.com/gradient-editor/#6639b6+0,000000+52 */\r\n    background: #6639b6; /* Old browsers */ /* FF3.6-15 */ /* Chrome10-25,Safari5.1-6 */\r\n    background: linear-gradient(135deg, #6639b6 0%,#000000 52%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */\r\n    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#6639b6', endColorstr='#000000',GradientType=1 ); /* IE6-9 fallback on horizontal gradient */\r\n    margin-top: 50px;\r\n}\r\n.app-pres-logo h1{\r\n    font-family: 'Open Sans', sans-serif;\r\n    color: white;\r\n    margin-top: 0;\r\n    margin-bottom: 0;\r\n}\r\n.app-pres-logo h2 span{\r\n    font-size: 5.5vw;\r\n    display: inline-block;\r\n}\r\n.app-pres-logo h2 span:first-child{\r\n    font-family: 'Alfa Slab One', cursive;\r\n    color: white;\r\n}\r\n.app-pres-logo h2 span:nth-child(2){\r\n\tbackground: linear-gradient(to left, #673AB7, white);\r\n\t-webkit-background-clip: text;\r\n\t-webkit-text-fill-color: transparent;\r\n    font-size: 20vw;\r\n    display: inline;\r\n}\r\n.app-pres-logo h2 span:last-child{\r\n    font-family: 'Righteous', cursive;\r\n    color: #673AB7;\r\n}\r\n.app-pres-logo a{\r\n    text-decoration: none;\r\n    color: white;\r\n    cursor:pointer;\r\n}\r\n.app-pres-socials a\r\n{\r\n    display: block;\r\n    font-size: 42px;\r\n    opacity: 0.4;\r\n    margin-bottom: 10px;\r\n    transition: all 0.5s ease-out;\r\n}\r\n.app-pres-socials a:hover\r\n{\r\n    opacity: 1;\r\n    color: white;\r\n    -webkit-transform: rotate(60deg);\r\n            transform: rotate(60deg);\r\n    -webkit-transform: scale(1.5);\r\n            transform: scale(1.5);\r\n}\r\n.ml5 {\r\n\r\n  font-weight: 300;\r\n  font-size: 120px;\r\n  color: #402d2d;\r\n}\r\n.ml5 .text-wrapper {\r\n  position: relative;\r\n  display: inline-block;\r\n  padding-top: 0.1em;\r\n  padding-right: 0.05em;\r\n  padding-bottom: 0.15em;\r\n  line-height: 1em;\r\n}\r\n.ml5 .line {\r\n  position: absolute;\r\n  left: 0;\r\n  top: 0;\r\n  bottom: 0;\r\n  margin: auto;\r\n  height: 3px;\r\n  width: 100%;\r\n  background-color: #402d2d;\r\n  -webkit-transform-origin: 0.5 0;\r\n          transform-origin: 0.5 0;\r\n}\r\n.ml5 .ampersand {\r\n  font-family: Baskerville, \"EB Garamond\", serif;\r\n  font-style: italic;\r\n  font-weight: 400;\r\n  width: 1em;\r\n  margin-right: -0.1em;\r\n  margin-left: -0.1em;\r\n}\r\n.ml5 .letters {\r\n  display: inline-block;\r\n  opacity: 0;\r\n}\r\n.container {\r\n\tdisplay: flex;\r\n\talign-items: center;\r\n\tjustify-content: center;\r\n\tmin-height: 100vh;\r\n}\r\nsvg {\r\n\tmax-width: 8rem;\r\n\twidth: 100%;\r\n\theight: auto;\r\n}"

/***/ }),

/***/ "./src/app/presentation/presentation.component.html":
/*!**********************************************************!*\
  !*** ./src/app/presentation/presentation.component.html ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"app-pres\">\r\n    <div class=\"row\">\r\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 row-no-padding\">\r\n            <div class=\"app-pres-logo mdl-card mdl-shadow--2dp text-center\">\r\n                <div>\r\n                    <h2 class=\"ml3\">\r\n                        <span class=\"animated fadeInLeftBig\">Développeur</span>\r\n                        <span> /</span>\r\n                        <span class=\"animated rotateInDownRight\">Web Designer</span>\r\n                    </h2>\r\n                </div>\r\n                <div class=\"mdl-card__supporting-text\">\r\n                </div>\r\n                <div class=\"row app-pres-socials\">\r\n                    <div class=\"col-xs-4 col-sm-2 col-md-2 col-lg-2\" *ngFor=\"let social of socials\">\r\n                        <a href=\"{{social.link}}\" title=\"{{social.title}}\">\r\n                            <i class=\"{{social.classIco}}\" aria-hidden=\"true\"></i>\r\n                        </a>\r\n                    </div>\r\n                </div>\r\n                <div class=\"mdl-card__actions mdl-card--border\">\r\n                    <a href=\"#skills\" class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\">\r\n                        Get Started\r\n                    </a>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <!--\r\n    <div class=\"row\">\r\n        <div class=\"col-lg-2 text-center\">\r\n            <svg version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\r\n                viewBox=\"0 0 512 512\" style=\"enable-background:new 0 0 512 512;\" xml:space=\"preserve\">\r\n                <path id=\"circle_yellow\" style=\"fill:#E4BA42;\" transform=\"translate(-800,0)\" d=\"M512,256c0,33.353-6.374,65.212-17.983,94.438c-6.207,15.632-13.908,30.511-22.936,44.45\r\n               c-11.243,17.387-24.545,33.322-39.549,47.449c-8.788,8.286-18.15,15.945-28.035,22.925C361.806,494.707,310.93,512,256,512\r\n               s-105.806-17.293-147.498-46.738c-12.372-8.735-23.928-18.526-34.534-29.268C28.233,389.757,0,326.165,0,256\r\n               S28.233,122.243,73.968,76.006c11.233-11.368,23.531-21.682,36.728-30.793C151.97,16.697,202.031,0,256,0\r\n               s104.03,16.697,145.304,45.213c10.083,6.949,19.634,14.618,28.588,22.925c15.684,14.503,29.539,30.96,41.19,48.974\r\n               c9.028,13.939,16.729,28.818,22.936,44.45C505.626,190.788,512,222.647,512,256z\" />\r\n                <g id=\"cube\" transform=\"translate(800,0)\" transform=\"rotate(8)\" style=\"opacity: 0;\">\r\n                    <path d=\"M391.05,232.97c-7.125-20.664-36.341-20.664-42.04-3.563c-5.7,17.101,13.539,27.076,43.466,37.053\r\n                   c29.927,9.976,48.454,36.341,44.891,59.854s-13.539,54.154-72.68,54.154c-36.963,0-57.505-23.103-67.714-40.429l33.511-20.138\r\n                   c0,0,11.401,24.227,32.777,24.227c21.377,0,29.927-7.125,29.927-23.514c0-19.951-69.118-27.076-79.806-61.279\r\n                   s3.563-82.656,53.441-79.094c31.175,2.227,48.71,17.535,57.478,28.703L391.05,232.97z\" />\r\n                    <path d=\"M235.714,183.805c0,0,0,120.421,0,136.81c0,16.388-14.251,24.94-28.502,22.089\r\n                   c-14.251-2.85-20.664-19.951-20.664-19.951l-32.777,22.089c0,0,7.125,32.777,52.016,35.628\r\n                   c44.891,2.85,70.542-24.227,70.542-47.029s0-149.636,0-149.636L235.714,183.805L235.714,183.805z\" />\r\n                    <path d=\"M73.968,45.213v390.781c10.606,10.742,22.162,20.532,34.534,29.268h294.996\r\n                   c9.885-6.98,19.247-14.639,28.035-22.925H96.893V68.138h374.188v326.75c9.028-13.939,16.729-28.818,22.936-44.45V45.213H73.968z\"\r\n                    />\r\n                </g>\r\n                <circle id=\"small_circle\" transform=\"translate(800,0)\" cx=\"87.855\" cy=\"339.143\" r=\"40.615\" />\r\n            </svg>\r\n        </div>\r\n        <div class=\"col-lg-2\">\r\n            <svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\r\n                width=\"376.119px\" height=\"363.433px\" viewBox=\"0 0 376.119 363.433\" enable-background=\"new 0 0 376.119 363.433\"\r\n                xml:space=\"preserve\">\r\n                <polygon id=\"polygon\" fill=\"none\" stroke=\"#DC2026\" transform=\"scale(0.1)\" style=\"opacity:0;\" stroke-width=\"7\" stroke-miterlimit=\"10\"\r\n                    points=\"187.55,12.905 28.642,68.828 \r\n\t53.752,277.022 187.719,350.654 322.375,276.028 347.478,67.838 \" />\r\n                <path id=\"text_left\" transform=\"translate(-300,0)\" fill=\"#DC2026\" d=\"M226.94,191.621l-39.762,18.594h-41.907l-19.7,49.271l-36.643,0.68l98.25-218.571L226.94,191.621z\r\n\t M223.097,182.259l-35.654-70.583l-29.247,69.37h28.98L223.097,182.259z\" />\r\n                <polygon id=\"text_right\" transform=\"translate(300,0)\" fill=\"#DC2026\" points=\"187.176,41.595 187.439,111.676 220.625,181.1 187.251,181.1 187.176,210.169 233.325,210.214 \r\n\t254.894,260.173 289.953,260.822 \" />\r\n            </svg>\r\n        </div>\r\n        <div class=\"col-lg-2\">\r\n            <svg version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\r\n                viewBox=\"0 0 512 512\" style=\"enable-background:new 0 0 512 512;\" xml:space=\"preserve\">\r\n                <path style=\"fill:#F2F2F2;\" d=\"M512,256c0,7.91-0.355,15.726-1.066,23.448c-0.543,6.113-1.317,12.152-2.299,18.119\r\n\tC488.782,419.182,383.227,512,256,512c-64.805,0-123.977-24.074-169.075-63.781c-16.666-14.66-31.41-31.462-43.802-49.977\r\n\tC15.882,357.564,0,308.632,0,256C0,114.615,114.615,0,256,0S512,114.615,512,256z\" />\r\n                <path id=\"text_sass\" style=\"fill:#CD6699;\" d=\"M446.767,284.975c-7.764,2.936-7.45,2.988-11.557-4.493c-5.245-9.529-8.035-19.55-8.276-30.448\r\n\tc-0.199-9.352,2.361-18.045,5.58-26.572c2.57-6.781-0.773-9.174-6.646-9.791c-4.274-0.439-8.683-0.397-12.967,0.042\r\n\tc-11.139,1.139-12.236,2.1-15.193,12.915c-1.755,6.416-3.156,12.884-6.071,18.975c-7.189,14.994-15.36,29.435-23.74,43.771\r\n\tc-1.505,2.581-2.748,5.36-4.869,7.565c-6.071-9.091-8.359-19.132-8.871-29.665c-0.512-10.397,2.675-20.062,6.175-29.623\r\n\tc1.181-3.218,0.199-5.214-2.581-6.604c-1.233-0.616-2.612-1.191-3.96-1.296c-7.147-0.564-14.273-0.481-21.243,1.473\r\n\tc-3.135,0.867-5.183,2.623-5.883,6.144c-1.358,6.886-3.479,13.573-6.343,20.01c-7.941,17.826-15.83,35.683-23.761,53.52\r\n\tc-6.896,15.496-13.688,31.033-21.859,45.913c-0.575,1.055-1.055,2.884-2.497,2.518c-1.463-0.366-0.951-2.163-1.014-3.396\r\n\tc-0.47-8.777,1.923-17.147,3.96-25.527c3.229-13.26,6.76-26.457,10.188-39.675c0.982-3.793-0.669-6.343-3.814-8.161\r\n\tc-4.524-2.602-9.028-2.727-13.928,0.919c0.669-5.392,0.961-10.125,0.731-14.858c-0.522-10.553-5.413-17.418-13.928-19.007\r\n\tc-6.217-1.16-12.1,0.648-17.659,3.281c-12.957,6.134-23.374,15.381-32.131,26.603c-1.024,1.306-2.058,2.508-3.542,3.312\r\n\tc-16.436,8.955-32.862,17.91-49.256,26.948c-1.797,1.003-2.957,0.721-4.253-0.669c-8.255-8.85-17.836-16.154-27.324-23.562\r\n\tc-13.26-10.365-26.979-20.187-38.421-32.684c-6.687-7.314-12.267-15.329-15.057-25.004c-4.556-15.82-1.149-30.553,6.437-44.554\r\n\tc8.976-16.562,22.288-29.351,36.968-40.741c23.312-18.077,48.88-32.434,75.828-44.251c30.177-13.218,61.482-21.734,94.824-20.449\r\n\tc13.208,0.512,26.028,2.8,37.794,9.268c8.328,4.577,13.845,11.191,15.402,20.898c1.829,11.368-0.899,21.87-5.945,31.828\r\n\tc-11.274,22.246-29.194,38.003-50.375,50.343c-17.638,10.271-36.665,16.792-56.801,20.208c-11.128,1.891-22.298,3.03-33.489,1.327\r\n\tc-12.842-1.954-24.712-6.248-33.499-16.593c-1.014-1.191-2.299-2.017-4.023-1.181c-1.766,0.857-1.63,2.424-1.463,3.929\r\n\tc0.125,1.034,0.408,2.079,0.773,3.062c2.351,6.343,6.75,11.128,11.901,15.308c13.396,10.898,29.268,14.096,45.934,14.42\r\n\tc16.311,0.324,32.371-1.745,48.264-5.548c35.85-8.568,65.881-26.154,87.803-56.289c13.103-18.014,21.4-37.867,20.668-60.583\r\n\tc-0.47-14.409-5.319-27.136-15.82-37.48c-12.487-12.278-27.982-18.453-44.607-22.162c-18.516-4.117-37.219-4.702-56.111-2.445\r\n\tc-16.436,1.964-32.496,5.329-48.128,10.71c-23.918,8.244-47.02,18.369-69.13,30.678c-22.653,12.601-44.001,27.032-62.725,45.108\r\n\tc-16.572,15.997-30.814,33.646-38.839,55.557c-3.427,9.383-5.893,19.028-3.594,29.174c2.947,13.061,9.383,24.367,17.847,34.565\r\n\tc12.8,15.444,28.505,27.606,44.701,39.225c13.009,9.341,26.624,17.847,39.121,27.888c3.542,2.842,3.521,2.842-0.648,5.026\r\n\tc-4.869,2.539-9.791,4.984-14.576,7.69C91.951,342.695,73.3,354.523,58.075,370.96c-7.492,8.098-12.581,17.189-14.952,27.282\r\n\tc12.392,18.516,27.136,35.318,43.802,49.977c28.432-2.215,50.197-17.011,66.278-41.482c7.764-11.818,11.4-25.192,12.769-39.299\r\n\tc1.202-12.434-0.063-24.472-3.72-36.342c-0.637-2.09-3.009-4.169-2.079-6.008c0.867-1.693,3.48-2.55,5.402-3.657\r\n\tc7.753-4.504,15.527-8.944,23.51-13.531c0.345,1.714-0.324,2.717-0.616,3.803c-4.577,16.792-7.764,33.719-4.284,51.169\r\n\tc2.163,10.867,5.768,21.096,12.622,30.093c7.053,9.258,22.8,8.202,29.194-0.251c6.071-8.025,10.094-17.074,14.284-26.081\r\n\tc2.299-4.932,4.409-9.947,6.604-14.932c-0.408,5.998-0.387,11.849-0.167,17.68c0.219,5.747,1.139,11.421,4.127,16.499\r\n\tc3.594,6.102,10.355,7.879,16.635,4.618c6.625-3.438,11.139-9.101,14.649-15.245c15.057-26.425,29.027-53.415,40.594-81.596\r\n\tc2.466-5.987,4.995-11.964,7.785-18.62c0.428,2.184,0.711,3.521,0.972,4.859c2.57,13.427,7.147,26.133,13.772,38.076\r\n\tc1.421,2.56,1.264,4.326-0.533,6.781c-6.102,8.307-12.79,16.123-19.383,24.022c-5.538,6.646-11.463,12.999-16.144,20.313\r\n\tc-4.2,6.583-1.787,13.322,5.204,14.817c2.152,0.46,4.42,0.596,6.625,0.564c12.215-0.146,23.489-3.793,33.991-9.77\r\n\tc14.137-8.056,22.518-19.864,22.131-36.676c-0.178-7.649-2.247-14.994-5.329-22.006c-0.679-1.557-0.711-2.685,0.303-4.148\r\n\tc9.791-14.023,18.442-28.724,26.394-43.854c1.411-2.664,2.403-5.622,4.681-8.223c0.303,1.055,0.543,1.714,0.679,2.393\r\n\tc2.529,12.539,5.935,24.795,12.33,35.986c1.755,3.062,0.878,4.618-1.546,6.666c-8.349,7.095-15.391,15.37-20.919,24.848\r\n\tc-4.305,7.377-7.252,15.255-7.22,23.897c0.031,9.613,7.387,15.276,16.76,13.019c9.77-2.341,18.829-6.322,26.958-12.267\r\n\tc17.711-12.967,22.904-26.645,17.356-45.735c-2.173-7.513-2.132-7.387,5.402-9.665c16.478-4.974,33.196-5.183,49.998-2.445\r\n\tc1.902,0.313,3.783,0.669,5.642,1.076c0.982-5.966,1.755-12.006,2.299-18.119C489.441,274.192,467.978,276.919,446.767,284.975z\r\n\t M98.586,419.401c-4.775,1.693-9.738,2.414-14.817,2.017c-6.322-0.502-10.334-4.963-10.742-11.672\r\n\tc-0.46-7.732,1.829-14.712,5.214-21.504c6.154-12.33,16.488-20.699,27.032-28.912c10.25-7.993,21.264-14.817,32.402-21.452\r\n\tc3.375-2.006,3.427-1.985,4.2,2.038c1.003,5.162,1.902,10.334,1.567,15.026C144.321,383.08,123.883,410.446,98.586,419.401z\r\n\t M251.956,277.514c-1.776,11.86-5.653,23.155-9.78,34.314c-5.622,15.235-11.097,30.542-18.171,45.192\r\n\tc-1.62,3.375-3.323,6.729-5.945,9.477c-2.476,2.602-4.671,2.299-6.384-0.878c-3.344-6.207-2.926-13.113-3.469-18.129\r\n\tc0.157-25.161,8.6-45.725,22.507-64.209c3.887-5.151,8.85-9.341,15.423-11.024C250.598,271.12,252.656,272.917,251.956,277.514z\r\n\t M349.341,352.005c-4.765,8.234-11.63,14.221-20.052,18.484c-0.899,0.449-2.058,1.243-2.873,0.188\r\n\tc-0.773-0.993,0.47-1.651,1.034-2.278c8.37-9.143,16.635-18.359,24.085-28.275c0.115-0.157,0.397-0.178,1.034-0.449\r\n\tC352.496,344.263,351.493,348.296,349.341,352.005z M407.134,351.65c-1.243,0.585-2.685,1.682-3.897,0.742\r\n\tc-1.337-1.034-0.805-2.863-0.397-4.263c1.902-6.384,4.462-12.497,7.993-18.192c2.967-4.796,6.646-8.986,10.689-12.894\r\n\tc1.63-1.567,2.361-1.379,2.915,0.878c0.575,2.309,0.627,4.618,0.669,6.969C425.002,337.753,418.471,346.311,407.134,351.65z\"\r\n                />\r\n            </svg>\r\n        </div>\r\n        <div>Icons made by\r\n            <a href=\"http://www.freepik.com\" title=\"Freepik\">Freepik</a> from\r\n            <a href=\"https://www.flaticon.com/\" title=\"Flaticon\">www.flaticon.com</a> is licensed by\r\n            <a href=\"http://creativecommons.org/licenses/by/3.0/\" title=\"Creative Commons BY 3.0\" target=\"_blank\">CC 3.0 BY</a>\r\n        </div>\r\n    </div>\r\n-->\r\n</div>"

/***/ }),

/***/ "./src/app/presentation/presentation.component.ts":
/*!********************************************************!*\
  !*** ./src/app/presentation/presentation.component.ts ***!
  \********************************************************/
/*! exports provided: PresComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PresComponent", function() { return PresComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _presentation_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./presentation.service */ "./src/app/presentation/presentation.service.ts");
/* harmony import */ var gsap_TweenMax__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! gsap/TweenMax */ "./node_modules/gsap/TweenMax.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



/* declare var anime: any;
declare var jquery:any;
declare var $ :any; */
var PresComponent = /** @class */ (function () {
    function PresComponent(_PresentationService) {
        this._PresentationService = _PresentationService;
    }
    PresComponent.prototype.ngOnInit = function () {
        var _this = this;
        var hue = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
        var animation_ease = gsap_TweenMax__WEBPACK_IMPORTED_MODULE_2__["Linear"].easeNone;
        var animation_js = new gsap_TweenMax__WEBPACK_IMPORTED_MODULE_2__["TimelineMax"]({
            repeat: -1,
            yoyo: true
        });
        var animation_angular = new gsap_TweenMax__WEBPACK_IMPORTED_MODULE_2__["TimelineMax"]({
            repeat: -1,
            yoyo: true
        });
        var animation_sass = new gsap_TweenMax__WEBPACK_IMPORTED_MODULE_2__["TimelineMax"]({
            repeat: -1,
            yoyo: true
        });
        animation_js
            .to("#circle_yellow", 4, { x: 0, ease: animation_ease }, 0, 0)
            .to("#small_circle", 4, { x: 0, ease: animation_ease }, 0, 0)
            .to("#small_circle", 4, { x: 0 }, 0, 0)
            .to("#small_circle", 0.2, { skewX: -60, scaleY: 0.2 }, "fly")
            .to("#small_circle", 4, { fill: hue }, 0, 0)
            .to("#cube", 4, {
            opacity: 1,
            fill: "rgb(255,255,255)",
            x: 0,
            rotation: 0,
            ease: animation_ease
        }, 0, 3000)
            .to("#small_circle", 4, { skew: 0 }, 0, 0);
        animation_angular
            .to("#text_left", 6, { x: 0, ease: animation_ease }, 0, 0)
            .to("#text_right", 6, { x: 0, ease: animation_ease }, 0, 0)
            .to("#polygon", 6, { opacity: 1, scale: 1, y: 0, x: 0 }, 0, 0);
        animation_sass
            .to("#text_sass", 4, { x: 0, y: 0, skewX: -60, scaleY: 0.2, ease: animation_ease }, 0, 0);
        this._PresentationService.getSocialsFromAPIwithCache()
            .subscribe(function (res) { return _this.socials = res; }, function (err) { return console.error(err.status); });
    };
    PresComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            moduleId: module.i,
            selector: 'app-pres',
            template: __webpack_require__(/*! ./presentation.component.html */ "./src/app/presentation/presentation.component.html"),
            styles: [__webpack_require__(/*! ./presentation.component.css */ "./src/app/presentation/presentation.component.css")]
        }),
        __metadata("design:paramtypes", [_presentation_service__WEBPACK_IMPORTED_MODULE_1__["PresentationService"]])
    ], PresComponent);
    return PresComponent;
}());



/***/ }),

/***/ "./src/app/presentation/presentation.module.ts":
/*!*****************************************************!*\
  !*** ./src/app/presentation/presentation.module.ts ***!
  \*****************************************************/
/*! exports provided: PresModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PresModule", function() { return PresModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _presentation_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./presentation.component */ "./src/app/presentation/presentation.component.ts");
/* harmony import */ var _presentation_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./presentation.service */ "./src/app/presentation/presentation.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};




var PresModule = /** @class */ (function () {
    function PresModule() {
    }
    PresModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]],
            declarations: [_presentation_component__WEBPACK_IMPORTED_MODULE_2__["PresComponent"]],
            exports: [_presentation_component__WEBPACK_IMPORTED_MODULE_2__["PresComponent"]],
            providers: [_presentation_service__WEBPACK_IMPORTED_MODULE_3__["PresentationService"]]
        })
    ], PresModule);
    return PresModule;
}());



/***/ }),

/***/ "./src/app/presentation/presentation.service.ts":
/*!******************************************************!*\
  !*** ./src/app/presentation/presentation.service.ts ***!
  \******************************************************/
/*! exports provided: PresentationService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PresentationService", function() { return PresentationService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var rxjs_add_operator_map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/add/operator/map */ "./node_modules/rxjs-compat/_esm5/add/operator/map.js");
/* harmony import */ var rxjs_add_operator_do__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/add/operator/do */ "./node_modules/rxjs-compat/_esm5/add/operator/do.js");
/* harmony import */ var rxjs_add_observable_throw__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/add/observable/throw */ "./node_modules/rxjs-compat/_esm5/add/observable/throw.js");
/* harmony import */ var rxjs_add_observable_of__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/add/observable/of */ "./node_modules/rxjs-compat/_esm5/add/observable/of.js");
/* harmony import */ var rxjs_add_operator_catch__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/add/operator/catch */ "./node_modules/rxjs-compat/_esm5/add/operator/catch.js");
/* harmony import */ var rxjs_add_operator_toPromise__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/add/operator/toPromise */ "./node_modules/rxjs-compat/_esm5/add/operator/toPromise.js");
/* harmony import */ var rxjs_add_operator_toPromise__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_toPromise__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var rxjs_internal_Observable__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rxjs/internal/Observable */ "./node_modules/rxjs/internal/Observable.js");
/* harmony import */ var rxjs_internal_Observable__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(rxjs_internal_Observable__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};










var PresentationService = /** @class */ (function () {
    function PresentationService(_http) {
        this._http = _http;
        this.url = '../assets/json/socials.json';
    }
    PresentationService.prototype.getSocialsFromAPIwithCache = function () {
        var _this = this;
        if (this.data) {
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_9__["of"])(this.data);
        }
        else if (this.observable) {
            return this.observable;
        }
        else {
            this.observable = this._http
                .get(this.url)
                .map(function (response) {
                _this.observable = null;
                _this.data = response;
                return _this.data;
            })
                .catch(function (error) {
                var errorMessage = "Une erreur " + error.status + " est survenue en tentant de joindre " + error.url;
                return rxjs_internal_Observable__WEBPACK_IMPORTED_MODULE_7__["Observable"].throw(errorMessage);
            });
            return this.observable;
        }
    };
    PresentationService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_8__["HttpClient"]])
    ], PresentationService);
    return PresentationService;
}());



/***/ }),

/***/ "./src/app/providers/auth.service.ts":
/*!*******************************************!*\
  !*** ./src/app/providers/auth.service.ts ***!
  \*******************************************/
/*! exports provided: AuthService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthService", function() { return AuthService; });
/* harmony import */ var firebase_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/app */ "./node_modules/firebase/app/dist/index.cjs.js");
/* harmony import */ var firebase_app__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(firebase_app__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_fire_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/fire/auth */ "./node_modules/@angular/fire/auth/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var AuthService = /** @class */ (function () {
    function AuthService(afAuth) {
        this.afAuth = afAuth;
        this.provider = new firebase_app__WEBPACK_IMPORTED_MODULE_0__["auth"].GoogleAuthProvider();
    }
    AuthService.prototype.loginWithGoogle = function () {
        return this.afAuth.auth.signInWithRedirect(this.provider);
    };
    AuthService.prototype.logout = function () {
        return firebase_app__WEBPACK_IMPORTED_MODULE_0__["auth"]().signOut();
    };
    AuthService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])(),
        __metadata("design:paramtypes", [_angular_fire_auth__WEBPACK_IMPORTED_MODULE_2__["AngularFireAuth"]])
    ], AuthService);
    return AuthService;
}());



/***/ }),

/***/ "./src/app/quotesService/quotes.service.ts":
/*!*************************************************!*\
  !*** ./src/app/quotesService/quotes.service.ts ***!
  \*************************************************/
/*! exports provided: QuotesService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "QuotesService", function() { return QuotesService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var rxjs_add_operator_map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/add/operator/map */ "./node_modules/rxjs-compat/_esm5/add/operator/map.js");
/* harmony import */ var rxjs_add_operator_do__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/add/operator/do */ "./node_modules/rxjs-compat/_esm5/add/operator/do.js");
/* harmony import */ var rxjs_add_observable_throw__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/add/observable/throw */ "./node_modules/rxjs-compat/_esm5/add/observable/throw.js");
/* harmony import */ var rxjs_add_observable_of__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/add/observable/of */ "./node_modules/rxjs-compat/_esm5/add/observable/of.js");
/* harmony import */ var rxjs_add_operator_catch__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/add/operator/catch */ "./node_modules/rxjs-compat/_esm5/add/operator/catch.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};







var QuotesService = /** @class */ (function () {
    function QuotesService(_http) {
        this._http = _http;
    }
    QuotesService.prototype.getQuotes = function () {
        this.random = Math.floor(Math.random() * 100);
        return this._http.get('https://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1&_=' + this.random) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
            .map(function (data1) { return data1; })
            .do(function (x) { return console.log(x); });
    };
    QuotesService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"]])
    ], QuotesService);
    return QuotesService;
}());



/***/ }),

/***/ "./src/app/scroll-back-button/scroll-back-button.component.css":
/*!*********************************************************************!*\
  !*** ./src/app/scroll-back-button/scroll-back-button.component.css ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".app-scroll-back-button{\r\n    position: fixed;\r\n    right: 10px;\r\n    top: 90%;\r\n    z-index: 3;\r\n}\r\n\r\nbutton {\r\n    opacity: 0;\r\n    transition: all 500ms ease-in;\r\n}\r\n\r\nbutton:hover{\r\n    -webkit-transform: scale(1.2);\r\n            transform: scale(1.2);\r\n}"

/***/ }),

/***/ "./src/app/scroll-back-button/scroll-back-button.component.html":
/*!**********************************************************************!*\
  !*** ./src/app/scroll-back-button/scroll-back-button.component.html ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<a href=\"#home\">\r\n<button class=\"mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored app-scroll-back-button\">\r\n    <i class=\"fas fa-arrow-circle-up\"></i>\r\n  </button>\r\n</a>\r\n"

/***/ }),

/***/ "./src/app/scroll-back-button/scroll-back-button.component.ts":
/*!********************************************************************!*\
  !*** ./src/app/scroll-back-button/scroll-back-button.component.ts ***!
  \********************************************************************/
/*! exports provided: ScrollBackButtonComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ScrollBackButtonComponent", function() { return ScrollBackButtonComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _windowElement_window_element_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../windowElement/window-element.service */ "./src/app/windowElement/window-element.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var ScrollBackButtonComponent = /** @class */ (function () {
    function ScrollBackButtonComponent(_elementRef, _WindowElementService) {
        this._elementRef = _elementRef;
        this._WindowElementService = _WindowElementService;
        this.window = this._WindowElementService.nativeWindow;
    }
    ScrollBackButtonComponent.prototype.colorButton = function () {
        this._elementRef.nativeElement.childNodes["0"].firstElementChild.style.backgroundColor = this.bgColorButton;
    };
    ScrollBackButtonComponent.prototype.windowScrollDisplay = function () {
        var self = this;
        this.window.addEventListener('scroll', function () {
            if (this.window.scrollY > 0) {
                self._elementRef.nativeElement.childNodes["0"].firstElementChild.style.opacity = 1;
            }
            else {
                self._elementRef.nativeElement.childNodes["0"].firstElementChild.style.opacity = 0;
            }
        });
    };
    ScrollBackButtonComponent.prototype.scrollTop = function () {
        this.window.scrollTo(0, 0);
    };
    ScrollBackButtonComponent.prototype.ngOnInit = function () {
        this.colorButton();
        this.windowScrollDisplay();
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", String)
    ], ScrollBackButtonComponent.prototype, "bgColorButton", void 0);
    ScrollBackButtonComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-scroll-back-button',
            template: __webpack_require__(/*! ./scroll-back-button.component.html */ "./src/app/scroll-back-button/scroll-back-button.component.html"),
            styles: [__webpack_require__(/*! ./scroll-back-button.component.css */ "./src/app/scroll-back-button/scroll-back-button.component.css")]
        }),
        __metadata("design:paramtypes", [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _windowElement_window_element_service__WEBPACK_IMPORTED_MODULE_1__["WindowElementService"]])
    ], ScrollBackButtonComponent);
    return ScrollBackButtonComponent;
}());



/***/ }),

/***/ "./src/app/skills/skills.component.css":
/*!*********************************************!*\
  !*** ./src/app/skills/skills.component.css ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".app-skills{\r\n    margin-top: 50px;\r\n    margin-bottom: 100px;    \r\n    background-color:\"#1A1A1A\";\r\n    margin-left: 10px;\r\n    margin-right: 10px;\r\n    \r\n}\r\n\r\n.app-skills-item span{\r\n    color: #6740B3;\r\n    display: block;\r\n    font-size: 1.5em;\r\n    letter-spacing: 2px;\r\n    line-height: normal;\r\n}\r\n\r\n.app-skills-item img{\r\n    width: 80%;\r\n}\r\n\r\n@media screen and (max-width: 640px) {\r\n    .app-skills-item span{\r\n        font-size: 1.3em;\r\n    }\r\n  }\r\n"

/***/ }),

/***/ "./src/app/skills/skills.component.html":
/*!**********************************************!*\
  !*** ./src/app/skills/skills.component.html ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"app-skills\">\r\n    <div class=\"row\">\r\n        <div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-6\">\r\n            <div class=\"app-skills-item-container\">\r\n                <div class=\"app-skills-item text-center\">\r\n                    <img src=\"assets/images/app-skills-responsive-img.png\" alt=\"\">\r\n                    <span>Responsive design</span>                    \r\n                </div>\r\n            </div>\r\n        </div>\r\n        <div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-6\">\r\n            <div class=\"app-skills-item-container\">\r\n                <div class=\"app-skills-item text-center\">\r\n                    <img src=\"assets/images/app-skills-reseaux-img.png\" alt=\"\">\r\n                    <span>Stratégie sur les réseaux sociaux</span>                    \r\n                </div>\r\n            </div>\r\n        </div>\r\n        <div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-6\">\r\n            <div class=\"app-skills-item-container\">\r\n                <div class=\"app-skills-item text-center\">\r\n                    <img src=\"assets/images/app-skills-identity-img.png\" alt=\"\">\r\n                    <span>Identité visuelle</span>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-6\">\r\n            <div class=\"app-skills-item-container\">\r\n                <div class=\"app-skills-item text-center\">\r\n                    <img src=\"assets/images/app-skills-dev-img.png\" alt=\"\">\r\n                    <span>Développement Web et Wordpress</span>                    \r\n                </div>\r\n            </div>\r\n        </div>                        \r\n    </div>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/skills/skills.component.ts":
/*!********************************************!*\
  !*** ./src/app/skills/skills.component.ts ***!
  \********************************************/
/*! exports provided: SkillsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SkillsComponent", function() { return SkillsComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var SkillsComponent = /** @class */ (function () {
    function SkillsComponent() {
    }
    SkillsComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            moduleId: module.i,
            selector: 'app-skills',
            template: __webpack_require__(/*! ./skills.component.html */ "./src/app/skills/skills.component.html"),
            styles: [__webpack_require__(/*! ./skills.component.css */ "./src/app/skills/skills.component.css")]
        })
    ], SkillsComponent);
    return SkillsComponent;
}());



/***/ }),

/***/ "./src/app/skills/skills.module.ts":
/*!*****************************************!*\
  !*** ./src/app/skills/skills.module.ts ***!
  \*****************************************/
/*! exports provided: SkillsModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SkillsModule", function() { return SkillsModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _skills_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./skills.component */ "./src/app/skills/skills.component.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};



var SkillsModule = /** @class */ (function () {
    function SkillsModule() {
    }
    SkillsModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]],
            declarations: [_skills_component__WEBPACK_IMPORTED_MODULE_2__["SkillsComponent"]],
            exports: [_skills_component__WEBPACK_IMPORTED_MODULE_2__["SkillsComponent"]]
        })
    ], SkillsModule);
    return SkillsModule;
}());



/***/ }),

/***/ "./src/app/weatherApi/weather.service.ts":
/*!***********************************************!*\
  !*** ./src/app/weatherApi/weather.service.ts ***!
  \***********************************************/
/*! exports provided: WeatherService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WeatherService", function() { return WeatherService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../environments/environment */ "./src/environments/environment.ts");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var rxjs_add_operator_map__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/add/operator/map */ "./node_modules/rxjs-compat/_esm5/add/operator/map.js");
/* harmony import */ var rxjs_add_operator_do__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/add/operator/do */ "./node_modules/rxjs-compat/_esm5/add/operator/do.js");
/* harmony import */ var rxjs_add_observable_throw__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/add/observable/throw */ "./node_modules/rxjs-compat/_esm5/add/observable/throw.js");
/* harmony import */ var rxjs_add_observable_of__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/add/observable/of */ "./node_modules/rxjs-compat/_esm5/add/observable/of.js");
/* harmony import */ var rxjs_add_operator_catch__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rxjs/add/operator/catch */ "./node_modules/rxjs-compat/_esm5/add/operator/catch.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};








var WeatherService = /** @class */ (function () {
    function WeatherService(_http) {
        this._http = _http;
    }
    WeatherService.prototype.getWeatherCurrent = function (cityName) {
        return this._http.get("https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=metric&appid=" + _environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].weatherApi.apiKeys) // appel virtuel comme vers un webservice // comme sur then(fn,fr) callback ok et non
            .map(function (data1) { return data1; })
            .do(function (x) { return console.log(x); });
    };
    WeatherService.prototype.getYourPosition = function (lat, long) {
        return this._http.get("https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + long + "&units=metric&appid=" + _environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].weatherApi.apiKeys)
            .map(function (data2) { return data2; })
            .do(function (x) { return console.log(x); });
    };
    WeatherService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"]])
    ], WeatherService);
    return WeatherService;
}());



/***/ }),

/***/ "./src/app/windowElement/window-element.service.ts":
/*!*********************************************************!*\
  !*** ./src/app/windowElement/window-element.service.ts ***!
  \*********************************************************/
/*! exports provided: WindowElementService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WindowElementService", function() { return WindowElementService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

function _window() {
    // return the global native browser window object
    return window;
}
var WindowElementService = /** @class */ (function () {
    function WindowElementService() {
    }
    Object.defineProperty(WindowElementService.prototype, "nativeWindow", {
        get: function () {
            return _window();
        },
        enumerable: true,
        configurable: true
    });
    WindowElementService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [])
    ], WindowElementService);
    return WindowElementService;
}());



/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
var environment = {
    production: false,
    firebase: {
        apiKey: "AIzaSyAcVDCvLIjsLJtPURCJmDzqAzom7lh9CfI",
        authDomain: "angular4-adrienleteintur-c4e11.firebaseapp.com",
        databaseURL: "https://angular4-adrienleteintur-c4e11.firebaseio.com",
        projectId: "angular4-adrienleteintur-c4e11",
        storageBucket: "angular4-adrienleteintur-c4e11.appspot.com",
        messagingSenderId: "537650330182"
    },
    weatherApi: {
        apiKeys: '28de745d768ffc16e78ffdd0c98c0779'
    },
    newsApi: {
        apiKeys: '38ebc5051f664a78bbfa50c9d9ceb5c2'
    }
};


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser-dynamic */ "./node_modules/@angular/platform-browser-dynamic/fesm5/platform-browser-dynamic.js");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
Object(_angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__["platformBrowserDynamic"])().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(function (err) { return console.log(err); });


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! C:\Users\ghost\Desktop\Portfolio-Services-Angular4\src\main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map