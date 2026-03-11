function parseDurationToMinutes(value) {
  const cleaned = (value || "").trim();
  if (!/^\d+:\d{2}$/.test(cleaned)) {
    return null;
  }

  const [hours, minutes] = cleaned.split(":").map(Number);
  if (minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

function formatMinutes(totalMinutes) {
  if (totalMinutes === null || totalMinutes === undefined || Number.isNaN(totalMinutes)) {
    return "-";
  }

  const minutes = Math.abs(Math.round(totalMinutes));
  const hoursPart = String(Math.floor(minutes / 60)).padStart(2, "0");
  const minutesPart = String(minutes % 60).padStart(2, "0");
  return `${hoursPart}:${minutesPart}`;
}

function formatCurrency(cents) {
  if (cents === null || cents === undefined || Number.isNaN(cents)) {
    return "-";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function syncEntryModePanels() {
  const control = document.querySelector("[data-entry-mode-control]");
  if (!control) {
    return;
  }

  const update = () => {
    const currentMode = control.value;
    document.querySelectorAll("[data-entry-mode-section]").forEach((section) => {
      const shouldShow = section.dataset.entryModeSection === currentMode;
      section.hidden = !shouldShow;
      section.querySelectorAll("input, select, textarea").forEach((field) => {
        field.disabled = !shouldShow;
      });
    });
  };

  control.addEventListener("change", update);
  update();
}

function syncSettingsPreview() {
  const form = document.querySelector("[data-settings-form]");
  if (!form) {
    return;
  }

  const salaryInput = form.querySelector("[data-salary-input]");
  const monthlyInput = form.querySelector("[data-monthly-input]");
  const weeklyInput = form.querySelector("[data-weekly-input]");
  const saturdayInput = form.querySelector("[data-saturday-multiplier]");
  const salaryPreview = document.querySelector("[data-preview-salary]");
  const monthlyPreview = document.querySelector("[data-preview-monthly]");
  const hourlyPreview = document.querySelector("[data-preview-hourly-rate]");
  const saturdayPreview = document.querySelector("[data-preview-saturday]");
  const weeklyHelper = document.querySelector("[data-weekly-helper]");

  const update = () => {
    const salary = Number.parseFloat((salaryInput?.value || "").replace(",", "."));
    const monthlyMinutes = parseDurationToMinutes(monthlyInput?.value);
    const weeklyMinutes = parseDurationToMinutes(weeklyInput?.value);
    const saturdayMultiplier = Number.parseFloat((saturdayInput?.value || "").replace(",", "."));

    const derivedMonthly = monthlyMinutes ?? (
      weeklyMinutes !== null ? Math.round((weeklyMinutes * 52) / 12) : null
    );

    if (salaryPreview) {
      salaryPreview.textContent = Number.isFinite(salary) ? formatCurrency(Math.round(salary * 100)) : "-";
    }

    if (monthlyPreview) {
      monthlyPreview.textContent = derivedMonthly !== null ? formatMinutes(derivedMonthly) : "-";
    }

    if (hourlyPreview) {
      if (Number.isFinite(salary) && derivedMonthly) {
        hourlyPreview.textContent = formatCurrency(Math.round((salary * 6000) / derivedMonthly));
      } else {
        hourlyPreview.textContent = "-";
      }
    }

    if (saturdayPreview) {
      if (Number.isFinite(saturdayMultiplier)) {
        saturdayPreview.textContent = `${Math.round((saturdayMultiplier - 1) * 100)}%`;
      } else {
        saturdayPreview.textContent = "-";
      }
    }

    if (weeklyHelper) {
      if (weeklyMinutes !== null) {
        weeklyHelper.textContent = `Sugestao baseada na jornada semanal: ${formatMinutes(Math.round((weeklyMinutes * 52) / 12))}.`;
      } else {
        weeklyHelper.textContent = "Se a carga mensal estiver vazia, a jornada semanal pode sugerir o valor mensal.";
      }
    }
  };

  [salaryInput, monthlyInput, weeklyInput, saturdayInput].forEach((input) => {
    input?.addEventListener("input", update);
  });
  update();
}

document.addEventListener("DOMContentLoaded", () => {
  syncEntryModePanels();
  syncSettingsPreview();
});
