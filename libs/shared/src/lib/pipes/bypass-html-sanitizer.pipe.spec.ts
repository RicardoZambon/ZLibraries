import { BypassHtmlSanitizerPipe } from './bypass-html-sanitizer.pipe';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

describe('BypassHtmlSanitizerPipe', () => {
  let pipe: BypassHtmlSanitizerPipe;
  let mockSanitizer: jest.Mocked<DomSanitizer>;

  beforeEach(() => {
    mockSanitizer = {
      bypassSecurityTrustHtml: jest.fn((html: string) => html as unknown as SafeHtml),
      sanitize: jest.fn(),
      bypassSecurityTrustStyle: jest.fn(),
      bypassSecurityTrustScript: jest.fn(),
      bypassSecurityTrustUrl: jest.fn(),
      bypassSecurityTrustResourceUrl: jest.fn(),
    } as unknown as jest.Mocked<DomSanitizer>;

    pipe = new BypassHtmlSanitizerPipe(mockSanitizer);
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should call bypassSecurityTrustHtml with the input', () => {
    const html: string = '<b>bold</b>';
    pipe.transform(html);
    expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(html);
  });

  it('should return the sanitizer result', () => {
    const html: string = '<p>test</p>';
    const result: SafeHtml = pipe.transform(html);
    expect(result).toBe(html);
  });

  it('should handle empty string', () => {
    pipe.transform('');
    expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('');
  });

  it('should pass through script tags without sanitizing', () => {
    const html: string = '<script>alert("xss")</script>';
    pipe.transform(html);
    expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(html);
  });
});
