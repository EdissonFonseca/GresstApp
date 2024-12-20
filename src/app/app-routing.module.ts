import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'chat-interlocutores',
    loadChildren: () => import('./pages/chat-interlocutores/chat-interlocutores.module').then( m => m.ChatInterlocutoresPageModule)
  },
  {
    path: 'cuenta',
    loadChildren: () => import('./pages/cuenta/cuenta.module').then( m => m.CuentaPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'materiales',
    loadChildren: () => import('./pages/materiales/materiales.module').then( m => m.MaterialesPageModule)
  },
  {
    path: 'punto-nuevo',
    loadChildren: () => import('./pages/punto-nuevo/punto-nuevo.module').then( m => m.PuntoNuevoPageModule)
  },
  {
    path: 'resumen',
    loadChildren: () => import('./pages/resumen/resumen.module').then( m => m.ResumenPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./pages/chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'embalajes',
    loadChildren: () => import('./pages/embalajes/embalajes.module').then( m => m.EmbalajesPageModule)
  },
  {
    path: 'insumos',
    loadChildren: () => import('./pages/insumos/insumos.module').then( m => m.InsumosPageModule)
  },
  {
    path: 'terceros',
    loadChildren: () => import('./pages/terceros/terceros.module').then( m => m.TercerosPageModule)
  },
  {
    path: 'puntos',
    loadChildren: () => import('./pages/puntos/puntos.module').then( m => m.PuntosPageModule)
  },
  {
    path: 'certificados-buscar',
    loadChildren: () => import('./pages/certificados-buscar/certificados-buscar.module').then( m => m.CertificadosBuscarPageModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then( m => m.PerfilPageModule)
  },
  {
    path: 'tutorial',
    loadChildren: () => import('./pages/tutorial/tutorial.module').then( m => m.TutorialPageModule)
  },
  {
    path: 'actividades',
    loadChildren: () => import('./pages/actividades/actividades.module').then( m => m.ActividadesPageModule)
  },
  {
    path: 'tareas',
    loadChildren: () => import('./pages/tareas/tareas.module').then( m => m.TareasPageModule)
  },
  {
    path: 'transacciones',
    loadChildren: () => import('./pages/transacciones/transacciones.module').then( m => m.TransaccionesPageModule)
  },
  {
    path: 'tratamientos',
    loadChildren: () => import('./pages/tratamientos/tratamientos.module').then( m => m.TratamientosPageModule)
  },
  {
    path: 'registro-correo',
    loadChildren: () => import('./pages/registro-correo/registro-correo.module').then( m => m.RegistroCorreoPageModule)
  },
  {
    path: 'registro-codigo',
    loadChildren: () => import('./pages/registro-codigo/registro-codigo.module').then( m => m.RegistroCodigoPageModule)
  },
  {
    path: 'registro-clave',
    loadChildren: () => import('./pages/registro-clave/registro-clave.module').then( m => m.RegistroClavePageModule)
  },
  {
    path: 'servicios',
    loadChildren: () => import('./pages/servicios/servicios.module').then( m => m.ServiciosPageModule)
  },
  {
    path: 'contrasena-correo',
    loadChildren: () => import('./pages/contrasena-correo/contrasena-correo.module').then( m => m.ContrasenaCorreoPageModule)
  },
  {
    path: 'contrasena-codigo',
    loadChildren: () => import('./pages/contrasena-codigo/contrasena-codigo.module').then( m => m.ContrasenaCodigoPageModule)
  },
  {
    path: 'contrasena-clave',
    loadChildren: () => import('./pages/contrasena-clave/contrasena-clave.module').then( m => m.ContrasenaClavePageModule)
  },
  {
    path: 'produccion',
    loadChildren: () => import('./pages/produccion/produccion.module').then( m => m.ProduccionPageModule)
  },
  {
    path: 'sincronizacion',
    loadChildren: () => import('./pages/sincronizacion/sincronizacion.module').then( m => m.SincronizacionPageModule)
  },
  {
    path: 'ruta',
    loadChildren: () => import('./pages/ruta/ruta.module').then( m => m.RutaPageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
