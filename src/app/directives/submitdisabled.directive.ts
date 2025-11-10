import { Directive, ElementRef, inject, HostListener, input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[submitdisabledDirective]'
})
export class SubmitdisabledDirective implements OnChanges {
  private el = inject(ElementRef)
  submitdisabledDirective = input<boolean>()
  constructor() {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['submitdisabledDirective'].currentValue === true) {

      this.el.nativeElement.disabled = false
      this.el.nativeElement.classList.remove("disabled");
    } else {
      this.el.nativeElement.disabled = true
      this.el.nativeElement.classList.add("disabled");
    }
  }
}
