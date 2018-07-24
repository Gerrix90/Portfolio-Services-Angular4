import { Component, ApplicationRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../providers/auth.service';

class NavModele {
    url: string;
    title: string;
    constructor(url: string, title: string) {
        this.url = url;
        this.title = title;
    }
}

@Component({
    moduleId: module.id,
    selector: 'app-nav',
    templateUrl: 'nav.component.html',
    styleUrls: ['nav.component.css']
})


export class NavComponent implements OnInit{

    array = [];
    sub: any;
    constructor(public authService: AuthService, public router: Router, private route: ActivatedRoute) { }
    
    login() {
        this.authService.loginWithGoogle();
    }
    
    ngOnInit() {
        this.array = [
            /* new NavModele(null,'Services',this.login), */
            new NavModele('#projects','Projects'),
            new NavModele('#jobs','Job Expériences'),
            new NavModele('#contact','Contact'),
        ];
        this.sub = this.route
            .data
            .subscribe(value => console.log(value));
    }
}