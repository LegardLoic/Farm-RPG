#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/../../../.." && pwd)"
fixtures_dir="${repo_root}/apps/api/test/fixtures"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

reset_first="${FIXTURE_RESET_FIRST:-true}"
scenario_input="${FIXTURE_SCENARIOS:-all}"

declare -a scenario_names

if [[ "${scenario_input}" == "all" ]]; then
  scenario_names=("baseline-authenticated-user" "mid-tower-progression" "active-combat-save-state")
else
  IFS=',' read -r -a raw_scenarios <<< "${scenario_input}"
  for raw_scenario in "${raw_scenarios[@]}"; do
    scenario="$(printf '%s' "${raw_scenario}" | tr -d '[:space:]')"
    [[ -z "${scenario}" ]] && continue
    scenario_names+=("${scenario}")
  done
fi

resolve_fixture_path() {
  case "$1" in
    baseline-authenticated-user)
      printf '%s\n' "${fixtures_dir}/01-baseline-authenticated-user.sql"
      ;;
    mid-tower-progression)
      printf '%s\n' "${fixtures_dir}/02-mid-tower-progression.sql"
      ;;
    active-combat-save-state)
      printf '%s\n' "${fixtures_dir}/03-active-combat-save-state.sql"
      ;;
    *)
      echo "Unknown fixture scenario: $1" >&2
      exit 1
      ;;
  esac
}

run_fixture() {
  local fixture_path="$1"
  if [[ ! -f "${fixture_path}" ]]; then
    echo "Missing fixture file: ${fixture_path}" >&2
    exit 1
  fi

  echo "Applying ${fixture_path##*/}"
  psql "${DATABASE_URL}" -v ON_ERROR_STOP=1 -f "${fixture_path}"
}

if [[ "${reset_first}" == "true" ]]; then
  run_fixture "${fixtures_dir}/00-reset.sql"
fi

for scenario_name in "${scenario_names[@]}"; do
  run_fixture "$(resolve_fixture_path "${scenario_name}")"
done

