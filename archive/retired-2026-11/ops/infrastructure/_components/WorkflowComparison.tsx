import styles from "../infrastructure.module.css"

const workflows = [
  {
    name: "Manual",
    steps: ["Request", "Brief", "Design", "Copy", "Assemble", "Review", "Publish"],
    caption: "People carry the work and coordinate the handoffs.",
    featured: false,
  },
  {
    name: "Agent-assisted",
    steps: ["Request", "Brief", "AI-assisted production", "Human handoffs", "Review", "Publish"],
    caption: "AI speeds up tasks. The process still needs a driver.",
    featured: false,
  },
  {
    name: "Operator-led",
    steps: ["Approved brief", "Scoped production line", "Review-ready page"],
    caption: "One defined input in. One predictable output out.",
    featured: true,
  },
]

export function WorkflowComparison({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${styles.comparison} ${compact ? styles.comparisonCompact : ""}`}>
      {workflows.map(({ name, steps, caption, featured }) => (
        <div
          key={name}
          className={`${styles.comparisonRow} ${featured ? styles.comparisonRowFeatured : ""}`}
        >
          <p className={styles.comparisonName}>{name}</p>
          <ol className={styles.comparisonFlow} aria-label={`${name} workflow steps`}>
            {steps.map((step, i) => (
              <li key={step} className={styles.comparisonStepItem}>
                {i > 0 && (
                  <span className={styles.comparisonArrow} aria-hidden="true">
                    →
                  </span>
                )}
                <span className={styles.comparisonStep}>{step}</span>
              </li>
            ))}
          </ol>
          <p className={styles.comparisonCaption}>{caption}</p>
        </div>
      ))}
    </div>
  )
}
