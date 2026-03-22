package sec.rule_204_2

# Enforces SEC rule 204-2: forecasts exceeding 10%% deviation must cite sources.

default allow := false

threshold := 0.10

deny[msg] {
    forecast_task
    deviation := forecast_deviation
    deviation > threshold
    count(input.forecast.citations) == 0
    msg := sprintf(
        "Forecast deviation %.1f%% exceeds %.0f%% limit without citation",
        [deviation * 100, threshold * 100],
    )
}

allow {
    count(deny) == 0
}

forecast_task {
    goal := input.task.goal
    is_string(goal)
    contains(lower(goal), "forecast")
}

forecast_task {
    intent := input.task.metadata.intent
    is_string(intent)
    lower(intent) == "forecast"
}

forecast_task {
    tags := input.task.tags
    some i
    tag := tags[i]
    is_string(tag)
    contains(lower(tag), "forecast")
}

forecast_deviation := deviation {
    deviation_value := input.forecast.deviation
    is_number(deviation_value)
    deviation := abs(deviation_value)
}

forecast_deviation := deviation {
    deviation_value := input.forecast.deviation
    is_string(deviation_value)
    parsed := to_number(deviation_value)
    deviation := abs(parsed)
}

forecast_deviation := deviation {
    baseline_value := input.forecast.baseline
    projection_value := input.forecast.projection
    baseline := to_number_if_possible(baseline_value)
    projection := to_number_if_possible(projection_value)
    baseline > 0
    delta := abs(projection - baseline)
    deviation := delta / baseline
}

to_number_if_possible(value) = number {
    is_number(value)
    number := value
}

to_number_if_possible(value) = number {
    is_string(value)
    number := to_number(value)
}
