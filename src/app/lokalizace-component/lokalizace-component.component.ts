import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-lokalizace-component',
  templateUrl: './lokalizace-component.component.html',
  styleUrls: ['./lokalizace-component.component.css']
})
export class LokalizaceComponentComponent implements OnInit {

  @Input() lokalizace: Array<string>;

  constructor(private translate: TranslateService) { }

  ngOnInit() {
  }


  lokalizuj(lokalizace: string) {
     this.translate.use(lokalizace);
  }
}
