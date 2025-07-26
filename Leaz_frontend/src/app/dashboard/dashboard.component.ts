import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ApiService } from "../api.service"
import { Router, RouterLink } from "@angular/router"
import { ActionMenuComponent } from "../shared/action-menu/action-menu.component"
import { ConfirmationModalComponent } from "../shared/confirmation-modal/confirmation-modal.component"
import { MoveItemModalComponent } from "../shared/move-item-modal/move-item-modal.component"
import { Store } from "@ngrx/store"
import { uploadFile } from "../Store/files.uploaded.actions"
import { MatExpansionModule } from "@angular/material/expansion"
import { MatProgressBarModule } from "@angular/material/progress-bar"

interface TermChange {
  term: string
  sectionOrClauseId: string
  oldClause: string | null
  newClause: string | null
  impact: "Minor" | "Major"
  wordChangePct: number
}

interface ClauseChange {
  clauseId: string
  oldText: string
  newText: string
  wordChangePct: number
}

interface ComparisonResponse {
  termChanges: TermChange[]
  clauseChanges: ClauseChange[]
  overallChangePct: number
  overallSummary: string
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  styleUrl: "./dashboard.component.scss",
  imports: [
    CommonModule,
    RouterLink,
    ActionMenuComponent,
    ConfirmationModalComponent,
    MoveItemModalComponent,
    MatExpansionModule,
    MatProgressBarModule,
  ],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService)
  private router = inject(Router)
  private store = inject(Store)

  // File upload properties
  firstDocument: File | null = null
  secondDocument: File | null = null

  // Loading and error states
  isLoading = false
  hasError = false
  errorMessage = ""
  analysisProgress = 0

  // Comparison results
  comparisonResult: ComparisonResponse | null = null
  termChanges: TermChange[] = []
  clauseChanges: ClauseChange[] = []
  overallSummary = ""
  overallChangePct = 0

  // Computed statistics
  get criticalDifferences(): TermChange[] {
    return this.termChanges.filter((change) => change.impact === "Major")
  }

  get minorDifferences(): TermChange[] {
    return this.termChanges.filter((change) => change.impact === "Minor")
  }

  get totalDifferences(): number {
    return this.termChanges.length
  }

  get addedClauses(): TermChange[] {
    return this.termChanges.filter((change) => change.oldClause === null)
  }

  get removedClauses(): TermChange[] {
    return this.termChanges.filter((change) => change.newClause === null)
  }

  get modifiedClauses(): TermChange[] {
    return this.termChanges.filter((change) => change.oldClause !== null && change.newClause !== null)
  }

  ngOnInit() {
    // Initialize component
  }

  onFileSelected(type: "firstDocument" | "secondDocument", event: any) {
    const file = event.target.files[0]
    if (type === "firstDocument") {
      this.firstDocument = file
    } else if (type === "secondDocument") {
      this.secondDocument = file
    }
    if (file) {
      this.store.dispatch(uploadFile({ fileType: type, file }))
    }
  }

  removeFile(type: "firstDocument" | "secondDocument") {
    if (type === "firstDocument") {
      this.firstDocument = null
    } else if (type === "secondDocument") {
      this.secondDocument = null
    }
  }

  private simulateProgress() {
    this.analysisProgress = 0
    const interval = setInterval(() => {
      this.analysisProgress += Math.random() * 15
      if (this.analysisProgress >= 95) {
        this.analysisProgress = 95
        clearInterval(interval)
      }
    }, 200)
  }

  processComparisonResults(res: ComparisonResponse) {
    this.comparisonResult = res
    this.termChanges = res.termChanges || []
    this.clauseChanges = res.clauseChanges || []
    this.overallSummary = res.overallSummary || ""
    this.overallChangePct = res.overallChangePct || 0
    this.analysisProgress = 100
  }

  onSubmit() {
    if (this.firstDocument && this.secondDocument) {
      this.isLoading = true
      this.hasError = false
      this.errorMessage = ""
      this.simulateProgress()

      const formData = new FormData()
      formData.append("oldContract", this.firstDocument)
      formData.append("newContract", this.secondDocument)

      this.apiService.compareDocuments(formData).subscribe({
        next: (res: ComparisonResponse) => {
          console.log("Comparison Success:", res)
          this.processComparisonResults(res)
          this.isLoading = false
        },
        error: (err: Error) => {
          console.error("Comparison Failed:", err)
          this.hasError = true
          this.errorMessage = "Something went wrong during file comparison. Please try again."
          this.isLoading = false
          this.analysisProgress = 0
        },
      })
    } else {
      alert("Please upload both files before submitting.")
    }
  }

  getImpactClass(impact: string): string {
    return impact === "Major" ? "impact-major" : "impact-minor"
  }

  getChangeTypeIcon(change: TermChange): string {
    if (change.oldClause === null) return "bi-plus-circle"
    if (change.newClause === null) return "bi-dash-circle"
    return "bi-pencil-square"
  }

  getChangeTypeLabel(change: TermChange): string {
    if (change.oldClause === null) return "Added"
    if (change.newClause === null) return "Removed"
    return "Modified"
  }
  
  
  onVisualiserClick() {
    this.router.navigate(['/visualiser']);
  }
}