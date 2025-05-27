import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class TaskItemComponent {
  @Input() tarea!: Tarea;
  @Input() showEdit: boolean = false;
  @Output() edit = new EventEmitter<string>();

  openEdit() {
    this.edit.emit(this.tarea.IdTarea);
  }
}
