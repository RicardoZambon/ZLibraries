import { NgIf } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize, tap } from 'rxjs';
import { AuthenticationService } from '../../../services';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

@Component({
  selector: 'shared-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    LanguageSelectorComponent,
    NgIf,
    ReactiveFormsModule,
    RouterModule,
    TranslatePipe,
  ]
})
export class LoginComponent implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('username') public username!: ElementRef<HTMLInputElement>;
  //#endregion

  //#region Variables
  protected form!: FormGroup;
  protected formState: {
    error: string | null,
    loading: boolean,
    success: boolean,
  } = {
    error: null,
    loading: false,
    success: false
  };

  private authenticationService: AuthenticationService = inject(AuthenticationService);
  private formBuilder: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods

  public ngOnInit(): void {
    this.form = this.formBuilder.group({
      password: ['', Validators.required],
      rememberMe: [false, { nonNullable: true }],
      username: ['', Validators.required],
    });
  }
  //#endregion

  //#region Event handlers
  public onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.valid) {
      this.form.disable();
      
      this.formState.loading = true;
      this.formState.error = null;

      this.authenticationService.authenticate({
        username: this.form.get('username')?.value.toString() ?? '',
        password: this.form.get('password')?.value.toString() ?? '',
        rememberMe: this.form.get('rememberMe')?.value ?? false
      })
      .pipe(
        tap(() => { 
          this.formState.success = true
        }),
        finalize(() => this.formState.loading = false)
      )
      .subscribe({
        next: () => {
          const params: URLSearchParams = new URLSearchParams(window.location.search);
          
          this.router.navigate([params.get('returnUrl') ?? '/']);
        },
        error: (e: string) => {
          this.form.enable();

          this.form.controls['password'].setValue('');
          this.form.controls['password'].markAsUntouched();
          
          this.username.nativeElement.focus();

          switch(e) {
            case 'InvalidUsernamePassword':
              this.formState.error = 'invalid';
              break;
            default:
              this.formState.error = 'internalServerError';
              break;
          }
        }
      });
    }
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}