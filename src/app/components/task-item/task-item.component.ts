import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Tarea } from 'src/app/interfaces/tarea.interface';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
})
export class TaskItemComponent {
  @Input() tarea!: Tarea;
  @Output() edit = new EventEmitter<string>();

  openEdit() {
    this.edit.emit(this.tarea.IdTarea);
  }
}
