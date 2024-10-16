import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TransactionApproveComponent } from 'src/app/components/transaction-approve/transaction-approve.component';
import { Estado, TipoServicio } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';
import { TaskAddComponent } from 'src/app/components/task-add/task-add.component';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { ModalController, NavController } from '@ionic/angular';
import { TransactionRejectComponent } from 'src/app/components/transaction-reject/transaction-reject.component';
import { ActividadesService } from 'src/app/services/actividades.service';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { TareasService } from 'src/app/services/tareas.service';
import { TaskEditComponent } from 'src/app/components/task-edit/task-edit.component';

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
    private actividadesService: ActividadesService,
    private transaccionesService: TransaccionesService,
    private tareasService: TareasService,
  ) {
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.idActividad=  params["IdActividad"],
      this.idTransaccion = params["IdTransaccion"],
      this.mode = params["Mode"]
    });
    const actividad = await this.actividadesService.get(this.idActividad);
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
      const transacciones = await this.transaccionesService.list(this.idActividad);
      if (this.idTransaccion)
        this.transacciones = transacciones.filter(x => x.IdTransaccion == this.idTransaccion);
      else
        this.transacciones = transacciones;
    } else {
      this.transacciones = await this.transaccionesService.list(this.idActividad);
    }
    this.tareas = await this.tareasService.listSugeridas(this.idActividad, this.idTransaccion);
    if (this.transacciones.length == 1)
    {
      const transaccion = this.transacciones[0];
      this.showAdd = transaccion.IdEstado == Estado.Pendiente;
    }
  }

  async handleInput(event: any){
    const query = event.target.value.toLowerCase();
    let transaccionesList = await this.transaccionesService.list(this.idActividad);
    const tareasList = await this.tareasService.listSugeridas(this.idActividad, this.idTransaccion);

    if (this.idTransaccion)
    {
      transaccionesList = await this.transaccionesService.list(this.idActividad);
      if (transaccionesList)
        transaccionesList = transaccionesList.filter(x => x.IdTransaccion == this.idTransaccion);
    }
    else
    {
      transaccionesList = await this.transaccionesService.list(this.idActividad);
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

  async updateVistaTransaccion(tarea: Tarea, esNuevo: boolean){
    const transaccion = this.transacciones.find(x => x.IdTransaccion == tarea.IdTransaccion);
    if (transaccion){
      switch(tarea.IdEstado){
        case Estado.Aprobado:
          transaccion.Cantidad = (transaccion.Cantidad ?? 0) + (tarea.Cantidad ?? 0);
          transaccion.Peso = (transaccion.Peso ?? 0) + (tarea.Peso ?? 0);
          transaccion.Volumen = (transaccion.Volumen ?? 0) + (tarea.Volumen ?? 0);
          transaccion.ItemsAprobados = (transaccion.ItemsAprobados ?? 0) + 1;
          if (!esNuevo)
            transaccion.ItemsPendientes = (transaccion.ItemsPendientes ?? 0) - 1;
          break;
        case Estado.Rechazado:
          transaccion.ItemsRechazados = (transaccion.ItemsRechazados ?? 0) + 1;
          transaccion.ItemsPendientes = (transaccion.ItemsPendientes ?? 0) - 1;
          break;
      }
      transaccion.Cantidades = await this.globales.getResumenCantidadesTarea(transaccion.Cantidad ?? 0, transaccion.Peso ?? 0, transaccion.Volumen ?? 0);
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
      await this.globales.showLoading('Actualizando información');
      if (data.IdTransaccion) {
        const transaccion = this.transacciones.find(x => x.IdTransaccion == data.IdTransaccion);
        if (!transaccion) {
          const transaccionGlobal = await this.transaccionesService.get(this.idActividad, data.IdTransaccion);
          if (transaccionGlobal) {
            this.transacciones.push(transaccionGlobal);
          }
        }
      }
      this.tareas.push(data);
      this.updateVistaTransaccion(data, true);
      await this.globales.hideLoading();
    }
  }

   /**
   * Abre popup para aprobar tarea. El componente modifica la tarea con el estado y retorna los datos a esta pagina
   * @param idTransaccion
   * @param idTarea
   */
   async openEditTarea(idTransaccion: string, idTarea: string) {
    const card = this.tareas.find(x => x.IdTarea == idTarea);
    if (!card) return;

    if (card.IdEstado != Estado.Pendiente && card.IdEstado != Estado.Inactivo) return;

    const modal =   await this.modalCtrl.create({
      component: TaskEditComponent,
      componentProps: {
        ActivityId: this.idActividad,
        TransactionId: idTransaccion,
        TaskId: idTarea,
        MaterialId: card.IdMaterial,
        ResidueId: card.IdResiduo,
        InputOutput: card.EntradaSalida
      },
    });

    await modal.present();

    const { data }  = await modal.onDidDismiss();
    if (data)
    {
      await this.globales.showLoading('Actualizando información');
      card.IdEstado = data.IdEstado;
      card.Cantidades = await this.globales.getResumenCantidadesTarea(data.Cantidad, data.Peso, data.Volumen);
      this.updateVistaTransaccion(data, false);
      await this.globales.hideLoading();
    }
  }

  async openApproveTransaccion(id: string){
    try {
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
        await this.globales.showLoading('Actualizando información');
        const transaccion = await this.transacciones.find(x => x.IdTransaccion == this.idTransaccion);
        if (transaccion){
          transaccion.IdEstado = Estado.Aprobado;
          this.showAdd = false;
        }
        await this.globales.hideLoading();
      }
    } catch {
      await this.globales.hideLoading();
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
      await this.globales.showLoading('Actualizando información');
      const transaccion = await this.transacciones.find(x => x.IdTransaccion == this.idTransaccion);
      if (transaccion) {
        transaccion.IdEstado = Estado.Rechazado;
      }
      await this.globales.hideLoading();
    }
  }
}
