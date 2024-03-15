import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
})
export class TutorialPage implements OnInit {
  step: number = 1;

  constructor(
    private navCtrl: NavController,
  ) { }

  ngOnInit() {
  }

  nextStep(){
    this.step++;
    if (this.step > 3)
    {
      this.navCtrl.navigateRoot('/home');
    }
  }
  previousStep(){
    this.step--;
  }
  navigateToHome(){
    this.navCtrl.navigateRoot('/home');
  }
}
