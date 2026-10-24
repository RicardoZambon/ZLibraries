import { Component, ElementRef, inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { APP_CONFIG, AppConfig } from '@zambon-dev/framework';
import { ButtonComponent } from '@zambon-dev/library';
import { finalize, tap } from 'rxjs';
import { AuthenticationService } from '../../../services';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

@Component({
  selector: 'shared-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ButtonComponent, LanguageSelectorComponent, ReactiveFormsModule, RouterModule, TranslatePipe],
})
export class LoginComponent implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('username') public username!: ElementRef<HTMLInputElement>;
  //#endregion

  //#region Variables
  protected form!: FormGroup;
  protected formState: {
    error: string | null;
    loading: boolean;
    success: boolean;
  } = {
    error: null,
    loading: false,
    success: false,
  };

  private authenticationService: AuthenticationService = inject(AuthenticationService);
  private config: AppConfig = inject(APP_CONFIG);
  private formBuilder: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);
  //#endregion

  //#region Properties
  /** Company line under the title, when the application supplies one. */
  protected get companyName(): string {
    return this.config.companyName;
  }

  /** The sign-in logo, falling back to the top bar's. Nothing is drawn when neither is set. */
  protected get logoUrl(): string | undefined {
    return this.config.loginLogoUrl ?? this.config.logoUrl;
  }
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

      this.authenticationService
        .authenticate({
          username: this.form.get('username')?.value.toString() ?? '',
          password: this.form.get('password')?.value.toString() ?? '',
          rememberMe: this.form.get('rememberMe')?.value ?? false,
        })
        .pipe(
          tap(() => {
            this.formState.success = true;
          }),
          finalize(() => (this.formState.loading = false)),
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

            switch (e) {
              case 'InvalidUsernamePassword':
                this.formState.error = 'invalid';
                break;
              default:
                this.formState.error = 'internalServerError';
                break;
            }
          },
        });
    }
  }
  //#endregion

  //#region Public methods
  /** A field is only shown as wrong once the user has been given a chance to fill it. */
  protected isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.touched && control.invalid;
  }
  //#endregion

  //#region Private methods
  //#endregion
}
