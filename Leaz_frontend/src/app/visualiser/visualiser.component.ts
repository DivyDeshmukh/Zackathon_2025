import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectFilefirstDocument,
  selectFilesecondDocument,
} from '../Store/files.uploaded.selectors';
import { Observable } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { diffTrimmedLines, diffWords } from 'diff';
import * as pdfjsLib from 'pdfjs-dist';

interface DiffWord {
  value: string;
  status: 'same' | 'added' | 'removed';
}

interface DiffLine {
  value: string;
  status: 'same' | 'added' | 'removed';
  words?: DiffWord[];
}

@Component({
  selector: 'app-visualiser',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualiser.component.html',
  styleUrls: ['./visualiser.component.scss'],
})
export class VisualiserComponent {
  firstFile$: Observable<File | null>;
  secondFile$: Observable<File | null>;
  leftLines: DiffLine[] = [];
  rightLines: DiffLine[] = [];

  constructor(private store: Store, private cdr: ChangeDetectorRef) {
    this.firstFile$ = this.store.select(selectFilefirstDocument);
    this.secondFile$ = this.store.select(selectFilesecondDocument);

    this.firstFile$.subscribe((file1) => {
      this.secondFile$.subscribe((file2) => {
        if (file1 && file2) {
          this.compareFiles(file1, file2);
        }
      });
    });
  }

  private async compareFiles(file1: File, file2: File) {
    Promise.all([this.readFileAsText(file1), this.readFileAsText(file2)]).then(
      ([text1, text2]) => {
        const diff = diffTrimmedLines(text1, text2);
        this.leftLines = [];
        this.rightLines = [];
        let leftIndex = 0;
        let rightIndex = 0;
        diff.forEach((part) => {
          const lines = part.value.split(/\r?\n/);
          if (lines[lines.length - 1] === '') lines.pop();
          lines.forEach((line) => {
            if (part.added) {
              this.leftLines.push({ value: '', status: 'same' });
              this.rightLines.push({
                value: line,
                status: 'added',
                words: this.getWordDiff('', line),
              });
              rightIndex++;
            } else if (part.removed) {
              this.leftLines.push({
                value: line,
                status: 'removed',
                words: this.getWordDiff(line, ''),
              });
              this.rightLines.push({ value: '', status: 'same' });
              leftIndex++;
            } else {
              // For unchanged lines, check if the lines are truly identical, else do word diff
              this.leftLines.push({ value: line, status: 'same' });
              this.rightLines.push({ value: line, status: 'same' });
              leftIndex++;
              rightIndex++;
            }
          });
        });
        // For lines that are present in both but have minor changes, do word diff
        for (let i = 0; i < this.leftLines.length; i++) {
          if (
            this.leftLines[i].status === 'same' &&
            this.rightLines[i].status === 'same' &&
            this.leftLines[i].value !== this.rightLines[i].value
          ) {
            this.leftLines[i].words = this.getWordDiff(
              this.leftLines[i].value,
              this.rightLines[i].value,
              'removed'
            );
            this.rightLines[i].words = this.getWordDiff(
              this.leftLines[i].value,
              this.rightLines[i].value,
              'added'
            );
          }
        }
        this.cdr.markForCheck();
      }
    );
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private getWordDiff(
    left: string,
    right: string,
    highlight?: 'added' | 'removed'
  ): DiffWord[] {
    const wordDiff = diffWords(left, right);
    return wordDiff.map((part) => ({
      value: part.value,
      status: part.added ? 'added' : part.removed ? 'removed' : 'same',
    }));
  }
}
