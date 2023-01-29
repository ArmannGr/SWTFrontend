import { Component, OnInit } from '@angular/core';
import {EditFileComponent} from "../dialogs/edit-file/edit-file.component";
import {RevertFileComponent} from "../dialogs/revert-file/revert-file.component";
import {CompareFilesComponent} from "../dialogs/compare-files/compare-files.component";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FileVersion} from "../data/types/FileVersion";
import {FileService} from "../data/service/file.service";
import { ActivatedRoute } from '@angular/router';
import {TextFile} from "../data/types/TextFile";

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css']
})
export class FileComponent implements OnInit {

  editFileRef: MatDialogRef<EditFileComponent> | undefined;
  revertFileRef: MatDialogRef<RevertFileComponent> | undefined;
  compareFileRef: MatDialogRef<CompareFilesComponent> | undefined;
  fileVersion: FileVersion[] = [];
  fileName: string = '';
  selectedOptions = [];
  selectedOption;
  textFile: TextFile;

  constructor(private dialog: MatDialog, private fileService: FileService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.fileService.getAllFiles().subscribe(files => {
      this.route.params.subscribe( (params) => {
            this.textFile = files.filter(file => file.name === params['fileName'])[0];
            this.fileVersion = files.filter(file => file.name === params['fileName'])[0].versions;
            this.fileVersion.sort((n1,n2) => {
              if (n1.versionId < n2.versionId) {
                return 1;
              }
              if (n1.versionId > n2.versionId) {
                return -1;
              }
              return 0;
            })
            this.fileName = params['fileName'];
      })
    })
  }

  onNgModelChange($event){
    this.selectedOption=$event;
  }

  convertStringToFile(){
    let versionId = this.selectedOption[0];
    this.dynamicDownloadTxt(this.fileName + ' -' + this.fileVersion.filter(version => version.versionId === versionId)[0].versionId + '- ' ,this.fileVersion.filter(version => version.versionId === versionId)[0].fileContent);

  }
  private setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  }

  dynamicDownloadTxt(fileName: string, content: string) {
      this.dyanmicDownloadByHtmlTag({
        fileName: fileName,
        text: content
      });
  }

  private dyanmicDownloadByHtmlTag(arg: {
    fileName: string,
    text: string
  }) {
    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement('a');
    }
    const element = this.setting.element.dynamicDownload;
    const fileType = arg.fileName.indexOf('.json') > -1 ? 'text/json' : 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`);
    element.setAttribute('download', arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }


  editFile() {
    //Textfile locken hier
    this.editFileRef = this.dialog.open(EditFileComponent, {
      width: '1000px',
      height: '800px',
      data: {
        //Daten an dialog übergeben
        versionId: this.selectedOption[0],
        name: this.textFile.name,
       // createdAt: this.textFile.createdAt,
       // versionCount: this.textFile.versionCount,
       // locked: this.textFile.locked,
       // versions: this.fileVersion.filter(obj => obj.versionId === this.selectedOption[0])
        versions: this.textFile.versions.filter((obj => obj.versionId === this.selectedOption[0]))
      }
    });


    // nach close dialog die textfile wieder unlocken oder wird diese vom backed automatisch unlocked
  }

  compareFiles() {
    this.compareFileRef = this.dialog.open(CompareFilesComponent);
  }

  resetFile(){
    this.fileService.resetFileToFormerVersion(this.textFile, this.selectedOption[0]).subscribe( tach => {
      window.location.reload();
    });
  }

}
