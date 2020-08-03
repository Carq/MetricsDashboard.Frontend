import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@material-ui/core";
import "./styles.scss";
import Histogram from "../histogram";
import PropTypes, { object } from "prop-types";
import classNames from "classnames";
import { metricConfiguration } from "../../propTypes";
import { colorStatuses, metricTypes } from "../../constants";
import { colorStatusToClassNames, metricTypeToSufix } from "../../utils";

class MetricTileContent extends React.Component {
  render() {
    const { current, data, configuration } = this.props;
    const {
      metricType,
      limit,
      wish,
      goal,
      unit,
      lowerIsBetter,
    } = configuration;
    const metricStatus =
      metricType === metricTypes.PERCENTAGE || lowerIsBetter === false
        ? this.calculateStatusGreater(current, limit, goal)
        : this.calculateStatusSmaller(current, limit, goal);

    return (
      <div className="metric-tile-content">
        <Table size="small" style={{ width: 200 }}>
          <TableBody>
            {this.renderMainTableRow(
              "Current",
              current,
              data,
              unit,
              metricType,
              metricStatus
            )}
            {this.renderTableRow("Limit", limit, metricType)}
            {this.renderTableRow("Goal", goal, metricType)}
            {this.renderTableRow("Wish", wish, metricType)}
          </TableBody>
        </Table>
      </div>
    );
  }

  renderMainTableRow = (name, value, data, unit, metricType, metricStatus) => (
    <TableRow key={name} align="center">
      <TableCell colSpan={2} align="center">
        <div className="metric-tile__current-section ">
          <div className="metric-tile__histogram">
            <Histogram
              data={data.map((item) => ({
                value: item.value,
                date: item.addedOn,
              }))}
              displayOnlyTime={false}
              colorData={this.calculateColor}
              valueSuffix={metricTypeToSufix(metricType, unit)}
            />
          </div>
          <Typography
            variant="h3"
            align="center"
            className={classNames(colorStatusToClassNames(metricStatus))}
          >
            {this.renderValues(value, metricType, unit)}
          </Typography>
        </div>
      </TableCell>
    </TableRow>
  );

  renderTableRow = (name, value, metricType, metricStatus) => (
    <TableRow key={name}>
      <TableCell align="right">
        <Typography>{name}</Typography>
      </TableCell>
      <TableCell align="center">
        <Typography
          className={classNames(colorStatusToClassNames(metricStatus))}
        >
          {this.renderValues(value, metricType)}
        </Typography>
      </TableCell>
    </TableRow>
  );

  renderValues = (value, valueType, unit) => {
    if (value === undefined || value === null) {
      return "-";
    }

    switch (valueType) {
      case "percentage":
        return `${value}%`;
      case "money":
        return `${value.toFixed(0)}` + (unit || "€");
      case "time":
        return this.getFormatedTime(value);
      default:
        return value;
    }
  };

  calculateStatusGreater = (current, limit, goal) => {
    if (current >= goal) return colorStatuses.GREEN;
    if (current >= limit) return colorStatuses.AMBER;
    return colorStatuses.RED;
  };

  calculateStatusSmaller = (current, limit, goal) => {
    if (current <= goal) return colorStatuses.GREEN;
    if (current <= limit) return colorStatuses.AMBER;
    return colorStatuses.RED;
  };

  getFormatedTime = (totalSeconds) => {
    const format = (val) => `${Math.floor(val)}`.slice(-2);
    const hours = format(totalSeconds / 3600);
    const minutes = format((totalSeconds % 3600) / 60);
    const seconds = format(totalSeconds % 60);

    let finalFormat = hours > 0 ? `${hours}h ` : "";
    finalFormat += minutes > 0 ? `${minutes}m ` : "";
    finalFormat += seconds > 0 ? `${seconds}s ` : "";

    return finalFormat;
  };

  calculateColor = (value) => {
    const { configuration } = this.props;
    const { metricType, limit, goal, lowerIsBetter } = configuration;

    return metricType === metricTypes.PERCENTAGE || lowerIsBetter === false
      ? this.calculateStatusGreater(value, limit, goal)
      : this.calculateStatusSmaller(value, limit, goal);
  };
}

MetricTileContent.propTypes = {
  current: PropTypes.number.isRequired,
  configuration: metricConfiguration,
  data: PropTypes.arrayOf(object),
};

export default MetricTileContent;
