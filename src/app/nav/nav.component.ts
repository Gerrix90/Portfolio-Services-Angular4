import { Component, ApplicationRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../providers/auth.service';

@Component({
    moduleId: module.id,
    selector: 'app-nav',
    templateUrl: 'nav.component.html',
    styleUrls: ['nav.component.css']
})

export class NavComponent implements OnInit{
    constructor(public authService: AuthService, private router: Router) { }

    login() {

        this.authService.loginWithGoogle().then((data) => {
        
        this.router.navigate(['login']);
        
        });
        
        }
        
        ngOnInit() {
        
        }
}