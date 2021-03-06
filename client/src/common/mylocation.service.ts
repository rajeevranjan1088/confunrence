import { Injectable } from '@angular/core';
import { toast } from './toast.service';
import { Observable } from 'rxjs/Observable';
import { Diagnostic } from '@ionic-native/diagnostic';
declare var google;

@Injectable()
export class MyLocation {
  public constructor(private diagnostic: Diagnostic, private _toast: toast) { }


  Get() {
    let opts = { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 };
    return Observable.create(observer => {
      if (window.navigator && window.navigator.geolocation) {
        window.navigator.geolocation.watchPosition((position) => {
          let geocoder = new google.maps.Geocoder();
          let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          geocoder.geocode({ 'latLng': location }, (results, status) => {
            observer.next(results);
          });
        }, (error) => {
          switch (error.code) {
            case 1:
              observer.error('errors.location.permissionDenied');
              break;
            case 2:
              observer.error('errors.location.positionUnavailable');
              break;
            case 3:
              observer.error('errors.location.timeout');
              break;
          }
        }, opts);
      } else {
        observer.error('errors.location.unsupportedBrowser');
      }
    });
  }


  CheckForGps() {
    console.log('called')
    return Observable.create(observer => {
      this.diagnostic.isLocationAvailable().then((res) => {
        if (res === false)
          this._toast.notify('Unable to fetech location, Open setting to turn on GPS', false, 'bottom', true, 'Open');
        if (res === true) {
          this.Get().subscribe(data => {
            observer.next(data);
          }, error => {
            this._toast.notify(error, 3000, 'bottom', false, '');
          });
        }
      }, err => {
         this._toast.notify(err, 3000, 'bottom', false, '');
      });
    });
  }
}

