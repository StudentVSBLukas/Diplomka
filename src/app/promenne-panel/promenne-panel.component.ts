import { Promenna } from '../data-model';
import { PromennaService } from '../services/promenna.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-promenne-panel',
  templateUrl: './promenne-panel.component.html',
  styleUrls: ['./promenne-panel.component.css']
})
export class PromennePanelComponent implements OnInit {
  
  @Input() promenne: Array<Promenna>;
  
  vybranaPromenna: Promenna;

  constructor(private promennaService: PromennaService) { }

  ngOnInit() {
  }

  odeberPromennou(promenna: Promenna) {
    this.promennaService.smaz(promenna);
    this.promenne = this.promennaService.list();
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

}
