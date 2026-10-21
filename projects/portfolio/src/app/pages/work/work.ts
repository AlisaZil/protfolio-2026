import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Card, ChipGroup, ChipGroupConfig, ProjectCardConfig } from 'ui';
import { PROJECT_CATEGORIES, PROJECTS, Project } from '../../data/projects';
import { techChip } from '../../data/tech';
import { SlideIn } from '../../shared/slide-in';
import { LanguageService } from '../../language/language.service';

const ALL = 'all';

@Component({
  selector: 'app-work',
  imports: [Card, ChipGroup, SlideIn],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './work.html',
  styleUrl: './work.scss',
})
export class Work {
  protected readonly language = inject(LanguageService);

  private readonly category = signal<string>(ALL);

  protected readonly filters = computed<ChipGroupConfig>(() => ({
    ariaLabel: this.language.t('work.filters'),
    chips: [ALL, ...PROJECT_CATEGORIES].map((id) => ({
      id,
      label: this.language.t(`work.categories.${id}`),
    })),
    // Keeps the current filter when the language (and so this config) changes.
    selectedIds: [this.category()],
  }));

  protected readonly cards = computed(() => {
    const category = this.category();
    return PROJECTS.filter((p) => category === ALL || p.category === category).map((p) => ({
      id: p.id,
      config: this.toCard(p),
    }));
  });

  protected onFilterChange(selectedIds: string[]): void {
    this.category.set(selectedIds[0] ?? ALL);
  }

  private toCard(project: Project): ProjectCardConfig {
    const external = !!project.url && /^https?:\/\//.test(project.url);
    return {
      variant: 'project',
      title: project.title,
      description: project.description,
      image: project.image,
      tags: project.tech.map(techChip),
      link: project.url
        ? {
            label: project.linkLabel ?? this.language.t('work.viewProject'),
            href: project.url,
            icon: 'arrow-right',
            target: external ? '_blank' : undefined,
          }
        : undefined,
    };
  }
}
