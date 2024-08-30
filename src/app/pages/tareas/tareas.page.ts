import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TransactionApproveComponent } from 'src/app/components/transaction-approve/transaction-approve.component';
import { TaskApproveComponent } from 'src/app/components/task-approve/task-approve.component';
import { TaskRejectComponent } from 'src/app/components/task-reject/task-reject.component';
import { Estado, TipoServicio } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';
import { TaskAddComponent } from 'src/app/components/task-add/task-add.component';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { ModalController, NavController } from '@ionic/angular';
import { TransactionRejectComponent } from 'src/app/components/transaction-reject/transaction-reject.component';

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.page.html',
  styleUrls: ['./tareas.page.scss'],
})
export class TareasPage implements OnInit {
  transacciones: Transaccion[] = [];
  tareas: Tarea[] = [];
  titulo: string = '';
  idActividad: string = '';
  actividad: string = '';
  idEstadoActividad: string = '';
  imagenActividad: string = '';
  idTransaccion: string = '';
  showDelivery: boolean = true;
  showAdd: boolean = true;
  mode: string = 'A';

  constructor(
    private globales: Globales,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
  ) {
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.idActividad=  params["IdActividad"],
      this.idTransaccion = params["IdTransaccion"],
      this.mode = params["Mode"]
    });
    const actividad = await this.globales.getActividad(this.idActividad);
    if (actividad){
      this.showDelivery = actividad.IdServicio == TipoServicio.Transporte || actividad.IdServicio == TipoServicio.Recoleccion;
      this.actividad = actividad.Titulo ?? '';
      this.titulo = await this.globales.getNombreServicio(actividad.IdServicio);
      this.idEstadoActividad = actividad.IdEstado!;
      this.imagenActividad = this.globales.servicios.find(x => x.IdServicio == actividad.IdServicio)?.Icono!;
    }
  }

  filterTareas(idTransaccion: string) {
    if (idTransaccion)
      return this.tareas.filter(x => x.IdTransaccion == idTransaccion);
    else
      return this.tareas.filter(x => !x.IdTransaccion);
  }

  getColorEstado(idEstado: string): string {
    return this.globales.getColorEstado(idEstado);
  }

  async ionViewWillEnter(){
    if (this.mode == "T") {
      const transacciones = await this.globales.getTransacciones(this.idActividad);
      if (this.idTransaccion)
        this.transacciones = transacciones.filter(x => x.IdTransaccion == this.idTransaccion);
      else
        this.transacciones = transacciones;
    } else {
      this.transacciones = await this.globales.getTransacciones(this.idActividad);
    }
    this.tareas = await this.globales.getTareasSugeridas(this.idActividad, this.idTransaccion);
    if (this.transacciones.length == 1)
    {
      const transaccion = this.transacciones[0];
      this.showAdd = transaccion.IdEstado == Estado.Pendiente;
    }
  }

  async handleInput(event: any){
    const query = event.target.value.toLowerCase();
    let transaccionesList = await this.globales.getTransacciones(this.idActividad);
    const tareasList = await this.globales.getTareasSugeridas(this.idActividad, this.idTransaccion);

    if (this.idTransaccion)
    {
      transaccionesList = await this.globales.getTransacciones(this.idActividad);
      if (transaccionesList)
        transaccionesList = transaccionesList.filter(x => x.IdTransaccion == this.idTransaccion);
    }
    else
    {
      transaccionesList = await this.globales.getTransacciones(this.idActividad);
    }
    const transaccionesFilter = transaccionesList.filter(trx => trx.Punto ?? trx.Tercero ?? ''.toLowerCase().indexOf(query) > -1);
    if (transaccionesFilter.length == 0){
      this.transacciones = transaccionesList;
      this.tareas = tareasList.filter((tarea) => tarea.Material ?? ''.toLowerCase().indexOf(query) > -1);
    } else {
      this.transacciones = transaccionesFilter;
      this.tareas = tareasList;
    }
  }

  async updateTransaccion(tarea: Tarea){
    const cuenta = await this.globales.getCuenta();

    const transaccion = this.transacciones.find(x => x.IdTransaccion == tarea.IdTransaccion);
    if (transaccion){
      switch(tarea.IdEstado){
        case Estado.Aprobado:
          transaccion.ItemsAprobados = (transaccion.ItemsAprobados ?? 0) + 1;
          transaccion.ItemsPendientes = (transaccion.ItemsPendientes ?? 0) - 1;
          break;
        case Estado.Rechazado:
          transaccion.ItemsPendientes = (transaccion.ItemsPendientes ?? 0) - 1;
          transaccion.ItemsRechazados = (transaccion.ItemsRechazados ?? 0) + 1;
          break;
      }
    }
  }

  async openAddTarea() {
    const modal =   await this.modalCtrl.create({
      component: TaskAddComponent,
      componentProps: {
        IdActividad: this.idActividad,
        IdTransaccion: this.idTransaccion,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      if (data.IdTransaccion)
      {
        const transaccion = this.transacciones.find(x => x.IdTransaccion == data.IdTransaccion);
        if (!transaccion)
        {
          const transaccionGlobal = await this.globales.getTransaccion(this.idActividad, data.IdTransaccion);
          if (transaccionGlobal) {
            this.transacciones.push(transaccionGlobal);
          }
        } else {
          transaccion.ItemsPendientes = (transaccion.ItemsPendientes ?? 0) + 1;
        }
      }
      const tarea = this.tareas.find((tarea) => tarea.IdMaterial == data.IdMaterial);
      if (tarea)
      {
        const cuenta = await this.globales.getCuenta();
        tarea.Cantidades = this.globales.getResumen(null, null, data.Cantidad, cuenta.UnidadCantidad, data.Peso, cuenta.UnidadPeso, data.Volumen, cuenta.UnidadVolumen);
        tarea.IdEstado = Estado.Aprobado;
      } else {
        this.tareas.push(data);
      }
    }
  }

  /**
   * Abre popup para aprobar tarea. El componente modifica la tarea con el estado y retorna los datos a esta pagina
   * @param idTransaccion
   * @param idTarea
   */
  async openApproveTarea(idTransaccion: string, idTarea: string) {
    const tarea = this.tareas.find(x => x.IdTarea == idTarea);
    if (!tarea) return;
    if (tarea.IdEstado != Estado.Pendiente && tarea.IdEstado != Estado.Inactivo) return;

    const modal =   await this.modalCtrl.create({
      component: TaskApproveComponent,
      componentProps: {
        ActivityId: this.idActividad,
        TransactionId: idTransaccion,
        TaskId: idTarea,
        MaterialId: tarea.IdMaterial,
        ResidueId: tarea.IdResiduo,
        InputOutput: tarea.EntradaSalida
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data)
    {
      const tarea = this.tareas.find((tarea) => tarea.IdMaterial == data.IdMaterial);
      if (tarea)
      {
        const cuenta = await this.globales.getCuenta();
        tarea.Cantidades = this.globales.getResumen(null, null, data.Cantidad, cuenta.UnidadCantidad, data.Peso, cuenta.UnidadPeso, data.Volumen, cuenta.UnidadVolumen);
        tarea.IdEstado = Estado.Aprobado;
        this.updateTransaccion(data);
      }
    }
  }

  async openRejectTarea(idTransaccion: string, idTarea: string) {
    const modal =   await this.modalCtrl.create({
      component: TaskRejectComponent,
      componentProps: {
        ActivityId: this.idActividad,
        TransactionId: idTransaccion,
        TaskId: idTarea,
      },
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data != null)
    {
      const tarea = this.tareas.find((material) => material.IdMaterial == data.IdMaterial);
      if (tarea) {
        const cuenta = await this.globales.getCuenta();
        tarea.Cantidades = this.globales.getResumen(null, null, data.Cantidad, cuenta.UnidadCantidad, data.Peso, cuenta.UnidadPeso, data.Volumen, cuenta.UnidadVolumen);
        tarea.IdEstado = Estado.Rechazado;
        this.updateTransaccion(data);
      }
    }
  }

  async openApproveTransaccion(id: string){
    const modal =   await this.modalCtrl.create({
      component: TransactionApproveComponent,
      componentProps: {
        ActivityId: this.idActividad,
        TransactionId: id,
      },
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data != null) {
      const transaccion = await this.transacciones.find(x => x.IdTransaccion == this.idTransaccion);
      if (transaccion){
        transaccion.IdEstado = Estado.Aprobado;
      }
    }
  }

  async openRejectTransaccion(id: string){
    const modal =   await this.modalCtrl.create({
      component: TransactionRejectComponent,
      componentProps: {
        ActivityId: this.idActividad,
        TransactionId: this.idTransaccion,
        TaskId: id,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data != null)
    {
      const transaccion = await this.transacciones.find(x => x.IdTransaccion == this.idTransaccion);
      if (transaccion) {
        transaccion.IdEstado = Estado.Rechazado;
      }
    }
  }
}
