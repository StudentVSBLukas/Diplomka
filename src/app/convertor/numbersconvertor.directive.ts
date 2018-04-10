import {Directive, EventEmitter, HostListener, Output} from '@angular/core';
import { NG_VALIDATORS } from '@angular/forms';

@Directive({
  selector: '[numbersConvertor]',
  })
export class NumbersConvertorDirective {
  @Output() ngModelChange: EventEmitter<any> = new EventEmitter();
  value: any;

  @HostListener('input', ['$event']) onInputChange($event) {
    const value = $event.target.value;
    if (!value) {
      return null;
    }

    this.value =  value.split(',').map(function(item, index, array) {
      const converted = parseInt(item.trim(), 10);
      if (!isNaN(converted)) {
        return converted;
      }

      if (index === array.length - 1 && item === '-') {
        return item;
      }

      return null;
    }).filter(function(item, index, array) {
      return item || (index === array.length - 1);
    });

    this.ngModelChange.emit(this.value);
  }
}