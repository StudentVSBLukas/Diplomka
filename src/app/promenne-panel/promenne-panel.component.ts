import { Promenna } from '../data-model';
import { PromennaService } from '../services/promenna.service';
import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/components/common/api';

@Component({
  selector: 'app-promenne-panel',
  templateUrl: './promenne-panel.component.html',
  styleUrls: ['./promenne-panel.component.css']
})
export class PromennePanelComponent implements OnInit {

  @Input() promenne: Array<Promenna>;

  vybranaPromenna: Promenna;

  constructor(private promennaService: PromennaService, private confirm: ConfirmationService,
    private translate: TranslateService) { }

  ngOnInit() {
  }

  odeberPromennou(promenna: Promenna, force: boolean) {
    if (force) {
      this._odeberPromennou(promenna);
      return;
    }

    this.confirm.confirm({
        message: this.translate.instant('confirm.promenna'),
        accept: () => {
          this._odeberPromennou(promenna);
        }
    });
  }

  openDialogOmezeni(promenna: Promenna) {
    this.vybranaPromenna = promenna;
  }

  closeDialogOmezeni(promenna:Promenna) {
    if (promenna) {
      this.promennaService.uprav(promenna);
      this.promenne = this.promennaService.list();
    }

    this.vybranaPromenna = null;
  }

  private _odeberPromennou(promenna: Promenna) {
    this.promennaService.smaz(promenna);
    this.promenne = this.promennaService.list();
  }
}
