/**
 * Component converts lines of folders into a curl command that can be run against aem 
 * via terminal to create a package with filters specified
    create package
        // curl -u admin:admin -X POST http://localhost:4502/crx/packmgr/service/.json/etc/packages/adc/navecomm/navecomm-content-updates-R215-25-Aug.zip\?cmd\=create -d packageName=navecomm-content-updates-R215-25-Aug -d groupName=adc/navecomm
    // update previously created package with filters
        // curl -u admin:admin -X POST http://localhost:4502/crx/packmgr/update.jsp -F path=/etc/packages/adc/navecomm/navecomm-content-updates-R212-13-Jul.zip -F packageName=navecomm-content-updates-R212-13-Jul -F groupName=adc/navecomm -F filter="[{\"root\" : \"/content/experience-fragments/adc/navecomm/countries/gb-en/login1\", \"rules\": []},{\"root\" : \"/content/experience-fragments/adc/navecomm/countries/gb-en/registration\", \"rules\": []} ]" -F '_charset_=UTF-8'
        // filters 
            // {\"root\" : \"${path}\", \"rules\": []},{\"root\" : \"${path2}\", \"rules\": []}
 */
/** TODO: clean up function names etc, maybe add user and password or url */
import React, { useState, useRef } from "react";
import styles from "../../styles/TextConverter.module.scss";

export default function TextConverter(props) {
  const [text, setText] = useState("");
  const [packageName, setPackageName] = useState("");
  const [groupName, setGroupName] = useState("");
  const textRef = useRef(null);

  const convertTextToCurlCreateCommand = (groupName, packageName, filters) => {
    return `curl -u admin:admin -X POST http://localhost:4502/crx/packmgr/service/.json/etc/packages${groupName}/${packageName}.zip\?cmd\=create -d packageName=${packageName} -d groupName=${groupName}`;
  };
  const convertTextToCurlFiltersHelper = (filters) => {
    const filtersLength = filters.length;
    return filters.map((path, i) => {
      const last = filtersLength === i + 1 ? ", " : "";
      return `{\\"root\\" : \\"${path}\\", \\"rules\\": []}${last}`;
    });
  };
  const convertTextToCurlAddFiltersToExistingPackageCommand = (
    groupName,
    packageName,
    filters
  ) => {
    const processedFilters = convertTextToCurlFiltersHelper(filters);
    return `curl -u admin:admin -X POST http://localhost:4502/crx/packmgr/update.jsp -F path=/etc/packages/${groupName}/${packageName}.zip -F packageName=${packageName} -F groupName=${groupName} -F filter="[ ${processedFilters} ]" -F '_charset_=UTF-8'`;
  };

  const TestButton = ({ buttonText, value }) => {
    const copytoClipBoard = (e) => {
      navigator.clipboard.writeText(value);
    };
    return (
      <button value={value} onClick={copytoClipBoard}>
        {buttonText}
      </button>
    );
  };
  const Test = ({ text, packageName, groupName }) => {
    const x = text.split("\n");
    const curlCreateCommand = convertTextToCurlCreateCommand(
      groupName,
      packageName
    );
    const curlUpdateCommand =
      convertTextToCurlAddFiltersToExistingPackageCommand(
        groupName,
        packageName,
        x
      );

    return (
      <React.Fragment>
        {packageName && groupName && text ? (
          <React.Fragment>
            <div>
              {curlCreateCommand}{" "}
              <TestButton buttonText={"Copy"} value={curlCreateCommand} />
            </div>
            <br />
            <div>
              {curlUpdateCommand}{" "}
              <TestButton buttonText={"Copy"} value={curlUpdateCommand} />
            </div>
            <br />
            <div>
              Give me single curl command{" "}
              <TestButton
                buttonText={"Copy"}
                value={`${curlCreateCommand} && ${curlUpdateCommand}`}
              />
            </div>
          </React.Fragment>
        ) : (
          <div> must enter packageName, groupName and filters</div>
        )}
      </React.Fragment>
    );
  };

  return (
    <>
      <div className={styles.textConverterOuter}>
        <div className={styles.inner}>
          <div className="row">
            <label>Enter package name : </label>
            <input
              name="packageName"
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
            ></input>
          </div>

          <br />
          <div className="row">
            <label>Enter package group : </label>
            <input
              name="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            ></input>
          </div>

          <br />
          <div className="row">
            <label>Enter value : </label>
            <textarea
              id="txtArea"
              rows="10"
              cols="70"
              name="textValue"
              value={text}
              ref={textRef}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
            <p>note: separate each line with a new line</p>
          </div>
        </div>
      </div>
      <div className={styles.result}>
        <Test text={text} packageName={packageName} groupName={groupName} />
      </div>
    </>
  );
}
