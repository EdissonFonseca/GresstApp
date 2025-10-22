import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '@app/domain/entities/task.entity';
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
  @Input() task!: Task;
  @Input() showEdit: boolean = false;
  @Output() edit = new EventEmitter<string>();

  openEdit() {
    this.edit.emit(this.task.TaskId);
  }
}
