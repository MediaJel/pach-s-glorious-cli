
import { MainContext } from '../interfaces/report-interface'
import { CPCSQLRequirements, OrganicSQLRequirements, } from '../interfaces/SQL-interface'

export default class SQLReports {
  private context: MainContext

  constructor(context: MainContext) {
    this.context = context
  }

  public getStatement(): string {
    switch (this.context.base.type) {
      case 'cpc': {
        return this.cpc.sqlText(this.context)
      }
      case 'organic': {
        return this.organic.sqlText(this.context)
      }
    }
  }
  public getColumns() {
    switch (this.context.base.type) {
      case 'cpc': {
        return this.cpc.columns
      }
      case 'organic': {
        return this.organic.columns
      }
    }
  }

  private cpc: CPCSQLRequirements = {
    sqlText(context: MainContext): string {
      const { base, sheetColumns } = context
      const { appId } = base
      const { RETAIL_ID, UTM_CAMPAIGN } = sheetColumns

      return `SELECT
      TR_ORDERID,
      TR_TOTAL,
      MKT_MEDIUM,
      MKT_SOURCE,
      MKT_CAMPAIGN,
      TRANSACTION_PAGE_URL,
      TRANSACTION_TIME,
      count(*) as CLICKS 
   FROM
      (
         WITH impressions AS 
         (
            SELECT
               concat_ws('', USER_IPADDRESS, USERAGENT) as MJFINGERPRINT_IMPRESSION,
               "APP_ID" as APP_ID_IMPRESSION,
               "COLLECTOR_TSTAMP" AS IMPRESSION_TIME,
               "PAGE_REFERRER" AS SEARCH_REFERRER,
               "REFR_URLHOST",
               "PAGE_URL" AS SEARCH_PAGE_URL,
               "PAGE_URLHOST",
               "NETWORK_USERID" AS IMPRESSIONS_ID,
               "concat"('cnnacookie=', "NETWORK_USERID") "cnnacookie",
               "USER_IPADDRESS",
               "USER_FINGERPRINT",
               "USERAGENT",
               "COLLECTOR_TSTAMP" as impressions_tstamp,
               "EVENT_ID" as IMPRESSIONS_EVENTID,
               MKT_MEDIUM,
               MKT_SOURCE,
               MKT_TERM,
               MKT_CONTENT,
               MKT_CAMPAIGN,
               MKT_CLICKID 
            FROM
               DATA_COLLECTION_DB.SNOWPLOW.BASE_EVENTS 
            where
               APP_ID = '${appId}' 
               and EVENT = 'page_view' 
               and MKT_CAMPAIGN = '${UTM_CAMPAIGN}' 
               AND USER_IPADDRESS NOT IN
               (
                  SELECT
                     USER_IPADDRESS 
                  FROM
                     (
                        SELECT
                           USER_IPADDRESS,
                           COUNT(USER_IPADDRESS) AS IPCOUNT 
                        FROM
                           DATA_COLLECTION_DB.SNOWPLOW.AD_IMPRESSIONS 
                        WHERE
                           COLLECTOR_TSTAMP > CURRENT_DATE() - 30 
                        GROUP BY
                           USER_IPADDRESS 
                        HAVING
                           ipcount > 99 
                     )
               )
            order by
               1,
               2 
         )
   ,
         transactions as 
         (
            SELECT
               concat_ws('', USER_IPADDRESS, USERAGENT) as MJFINGERPRINT_TRANSACTION,
               NETWORK_USERID AS TRANSACTION_ID,
               APP_ID as APP_ID_TRANSACTION,
               COLLECTOR_TSTAMP as TRANSACTION_TIME,
               PAGE_URL AS TRANSACTION_PAGE_URL,
               USER_IPADDRESS AS TRANSACTION_IP_ADDRESS,
               USER_FINGERPRINT AS TRANSACTION_FINGERPRINT,
               USERAGENT AS TRANSACTION_USERAGENT,
               TR_ORDERID,
               TR_AFFILIATION,
               TR_TOTAL 
            FROM
               DATA_COLLECTION_DB.SNOWPLOW.COMMERCE_TRANSACTIONS 
            where
               APP_ID = '${appId}' 
               AND TRANSACTION_PAGE_URL LIKE ANY ('%${RETAIL_ID}%') 
               AND USER_IPADDRESS NOT IN
               (
                  SELECT
                     USER_IPADDRESS 
                  FROM
                     (
                        SELECT
                           USER_IPADDRESS,
                           count(*) as IPCOUNT 
                        FROM
                           DATA_COLLECTION_DB.SNOWPLOW.COMMERCE_TRANSACTIONS 
                        WHERE
                           COLLECTOR_TSTAMP > CURRENT_DATE() - 180 
                        GROUP BY
                           USER_IPADDRESS 
                        HAVING
                           IPCOUNT > 15 
                     )
               )
            order by
               1,
               2 
         )
         SELECT
            APP_ID_IMPRESSION,
            IMPRESSIONS_ID AS MJID_IMPRESSION,
            IMPRESSION_TIME,
            TRANSACTION_USERAGENT,
            USERAGENT,
            SEARCH_REFERRER,
            SEARCH_PAGE_URL,
            APP_ID_TRANSACTION,
            TRANSACTION_ID AS MJID_TRANSACTION,
            TRANSACTION_TIME,
            TRANSACTION_PAGE_URL,
            TR_ORDERID,
            TR_TOTAL,
            MKT_MEDIUM,
            MKT_SOURCE,
            MKT_TERM,
            MKT_CONTENT,
            MKT_CAMPAIGN,
            MKT_CLICKID,
            IMPRESSIONS_EVENTID,
            PAGE_URLHOST,
            MJFINGERPRINT_TRANSACTION,
            MJFINGERPRINT_IMPRESSION,
            USER_IPADDRESS AS IMPRESSION_IP_ADDRESS,
            TRANSACTION_IP_ADDRESS 
         FROM
            (
               impressions 
               JOIN
                  transactions 
                  ON impressions.IMPRESSIONS_ID = transactions.TRANSACTION_ID 
            )
         where
            IMPRESSION_TIME < TRANSACTION_TIME 
            AND TRANSACTION_ID != '00000000-0000-4000-A000-000000000000' 
         UNION
         SELECT
            APP_ID_IMPRESSION,
            IMPRESSIONS_ID AS MJID_IMPRESSION,
            IMPRESSION_TIME,
            TRANSACTION_USERAGENT,
            USERAGENT,
            SEARCH_REFERRER,
            SEARCH_PAGE_URL,
            APP_ID_TRANSACTION,
            TRANSACTION_ID AS MJID_TRANSACTION,
            TRANSACTION_TIME,
            TRANSACTION_PAGE_URL,
            TR_ORDERID,
            TR_TOTAL,
            MKT_MEDIUM,
            MKT_SOURCE,
            MKT_TERM,
            MKT_CONTENT,
            MKT_CAMPAIGN,
            MKT_CLICKID,
            IMPRESSIONS_EVENTID,
            PAGE_URLHOST,
            MJFINGERPRINT_TRANSACTION,
            MJFINGERPRINT_IMPRESSION,
            USER_IPADDRESS AS IMPRESSION_IP_ADDRESS,
            TRANSACTION_IP_ADDRESS 
         FROM
            (
               impressions 
               JOIN
                  transactions 
                  ON impressions.MJFINGERPRINT_IMPRESSION = transactions.MJFINGERPRINT_TRANSACTION 
            )
         where
            IMPRESSION_TIME < TRANSACTION_TIME 
         UNION
         SELECT
            APP_ID_IMPRESSION,
            IMPRESSIONS_ID AS MJID_IMPRESSION,
            IMPRESSION_TIME,
            TRANSACTION_USERAGENT,
            USERAGENT,
            SEARCH_REFERRER,
            SEARCH_PAGE_URL,
            APP_ID_TRANSACTION,
            TRANSACTION_ID AS MJID_TRANSACTION,
            TRANSACTION_TIME,
            TRANSACTION_PAGE_URL,
            TR_ORDERID,
            TR_TOTAL,
            MKT_MEDIUM,
            MKT_SOURCE,
            MKT_TERM,
            MKT_CONTENT,
            MKT_CAMPAIGN,
            MKT_CLICKID,
            IMPRESSIONS_EVENTID,
            PAGE_URLHOST,
            MJFINGERPRINT_TRANSACTION,
            MJFINGERPRINT_IMPRESSION,
            USER_IPADDRESS AS IMPRESSION_IP_ADDRESS,
            TRANSACTION_IP_ADDRESS 
         FROM
            (
               impressions 
               JOIN
                  transactions 
                  ON impressions.USER_IPADDRESS = transactions.TRANSACTION_IP_ADDRESS
            )
         where
            IMPRESSION_TIME < TRANSACTION_TIME 
            AND TRANSACTION_IP_ADDRESS NOT IN
            (
               SELECT
                  USER_IPADDRESS 
               FROM
                  (
                     SELECT
                        USER_IPADDRESS,
                        COUNT(USER_IPADDRESS) AS IPCOUNT 
                     FROM
                        DATA_COLLECTION_DB.SNOWPLOW.AD_IMPRESSIONS 
                     WHERE
                        COLLECTOR_TSTAMP > CURRENT_DATE() - 30 
                     GROUP BY
                        USER_IPADDRESS 
                     HAVING
                        ipcount > 99
                  )
            )
      )
   GROUP BY
      TR_ORDERID,
      TR_TOTAL,
      MKT_MEDIUM,
      MKT_SOURCE,
      MKT_CAMPAIGN,
      TRANSACTION_PAGE_URL,
      TRANSACTION_TIME 
   order by
      CLICKS DESC;`
    },
    columns: {
      TR_ORDERID: {},
      TR_TOTAL: {},
      MKT_MEDIUM: {},
      MKT_SOURCE: {},
      MKT_CAMPAIGN: {},
      TRANSACTION_PAGE_URL: {},
      TRANSACTION_TIME: {},
      CLICKS: {},
    }
  }

  private organic: OrganicSQLRequirements = {
    sqlText(context: MainContext): string {
      const { base, sheetColumns } = context
      const { appId } = base
      const { RETAIL_ID } = sheetColumns

      return ` SELECT
      TR_ORDERID,
      TR_TOTAL,
      TRANSACTION_TIME,
      TRANSACTION_PAGE_URL,
      REFR_TERM,
      REFR_MEDIUM,
      REFR_SOURCE 
   FROM
      (
         WITH impressions AS 
         (
            SELECT
               concat_ws('', USER_IPADDRESS, USERAGENT) as MJFINGERPRINT_IMPRESSION,
               "APP_ID" as APP_ID_IMPRESSION,
               "COLLECTOR_TSTAMP" AS IMPRESSION_TIME,
               "PAGE_REFERRER" AS SEARCH_REFERRER,
               "REFR_URLHOST",
               "PAGE_URL" AS SEARCH_PAGE_URL,
               "PAGE_URLHOST",
               "NETWORK_USERID" AS IMPRESSIONS_ID,
               "concat"('cnnacookie=', "NETWORK_USERID") "cnnacookie",
               "USER_IPADDRESS",
               "USER_FINGERPRINT",
               "USERAGENT",
               "COLLECTOR_TSTAMP" as impressions_tstamp,
               "EVENT_ID" as IMPRESSIONS_EVENTID,
               MKT_MEDIUM,
               MKT_SOURCE,
               MKT_TERM,
               MKT_CONTENT,
               MKT_CAMPAIGN,
               MKT_CLICKID,
               REFR_TERM,
               REFR_MEDIUM,
               REFR_SOURCE 
            FROM
               DATA_COLLECTION_DB.SNOWPLOW.BASE_EVENTS 
            where
               APP_ID = '${appId}' 
               and EVENT = 'page_view' 
               AND REFR_TERM IS NOT NULL 
               AND USER_IPADDRESS NOT IN
               (
                  SELECT
                     USER_IPADDRESS 
                  FROM
                     (
                        SELECT
                           USER_IPADDRESS,
                           COUNT(USER_IPADDRESS) AS IPCOUNT 
                        FROM
                           DATA_COLLECTION_DB.SNOWPLOW.AD_IMPRESSIONS 
                        WHERE
                           COLLECTOR_TSTAMP > CURRENT_DATE() - 30 
                        GROUP BY
                           USER_IPADDRESS 
                        HAVING
                           ipcount > 99 
                     )
               )
            order by
               1,
               2 
         )
   ,
         transactions as 
         (
            SELECT
               concat_ws('', USER_IPADDRESS, USERAGENT) as MJFINGERPRINT_TRANSACTION,
               NETWORK_USERID AS TRANSACTION_ID,
               APP_ID as APP_ID_TRANSACTION,
               COLLECTOR_TSTAMP as TRANSACTION_TIME,
               PAGE_URL AS TRANSACTION_PAGE_URL,
               USER_IPADDRESS AS TRANSACTION_IP_ADDRESS,
               USER_FINGERPRINT AS TRANSACTION_FINGERPRINT,
               USERAGENT AS TRANSACTION_USERAGENT,
               TR_ORDERID,
               TR_AFFILIATION,
               TR_TOTAL 
            FROM
               DATA_COLLECTION_DB.SNOWPLOW.COMMERCE_TRANSACTIONS 
            where
               APP_ID = '${appId}' 
               AND TRANSACTION_PAGE_URL LIKE ANY ('%${RETAIL_ID}%') 
               AND USER_IPADDRESS NOT IN
               (
                  SELECT
                     USER_IPADDRESS 
                  FROM
                     (
                        SELECT
                           USER_IPADDRESS,
                           count(*) as IPCOUNT 
                        FROM
                           DATA_COLLECTION_DB.SNOWPLOW.COMMERCE_TRANSACTIONS 
                        WHERE
                           COLLECTOR_TSTAMP > CURRENT_DATE() - 180 
                        GROUP BY
                           USER_IPADDRESS 
                        HAVING
                           IPCOUNT > 15 
                     )
               )
            order by
               1,
               2 
         )
         SELECT
            APP_ID_IMPRESSION,
            IMPRESSIONS_ID AS MJID_IMPRESSION,
            IMPRESSION_TIME,
            TRANSACTION_USERAGENT,
            USERAGENT,
            SEARCH_REFERRER,
            SEARCH_PAGE_URL,
            APP_ID_TRANSACTION,
            TRANSACTION_ID AS MJID_TRANSACTION,
            TRANSACTION_TIME,
            TRANSACTION_PAGE_URL,
            TR_ORDERID,
            TR_TOTAL,
            MKT_MEDIUM,
            MKT_SOURCE,
            MKT_TERM,
            MKT_CONTENT,
            MKT_CAMPAIGN,
            MKT_CLICKID,
            IMPRESSIONS_EVENTID,
            PAGE_URLHOST,
            MJFINGERPRINT_TRANSACTION,
            MJFINGERPRINT_IMPRESSION,
            USER_IPADDRESS AS IMPRESSION_IP_ADDRESS,
            TRANSACTION_IP_ADDRESS,
            REFR_TERM,
            REFR_MEDIUM,
            REFR_SOURCE 
         FROM
            (
               impressions 
               JOIN
                  transactions 
                  ON impressions.IMPRESSIONS_ID = transactions.TRANSACTION_ID 
            )
         where
            IMPRESSION_TIME < TRANSACTION_TIME 
            AND TRANSACTION_ID != '00000000-0000-4000-A000-000000000000' 
         UNION
         SELECT
            APP_ID_IMPRESSION,
            IMPRESSIONS_ID AS MJID_IMPRESSION,
            IMPRESSION_TIME,
            TRANSACTION_USERAGENT,
            USERAGENT,
            SEARCH_REFERRER,
            SEARCH_PAGE_URL,
            APP_ID_TRANSACTION,
            TRANSACTION_ID AS MJID_TRANSACTION,
            TRANSACTION_TIME,
            TRANSACTION_PAGE_URL,
            TR_ORDERID,
            TR_TOTAL,
            MKT_MEDIUM,
            MKT_SOURCE,
            MKT_TERM,
            MKT_CONTENT,
            MKT_CAMPAIGN,
            MKT_CLICKID,
            IMPRESSIONS_EVENTID,
            PAGE_URLHOST,
            MJFINGERPRINT_TRANSACTION,
            MJFINGERPRINT_IMPRESSION,
            USER_IPADDRESS AS IMPRESSION_IP_ADDRESS,
            TRANSACTION_IP_ADDRESS,
            REFR_TERM,
            REFR_MEDIUM,
            REFR_SOURCE 
         FROM
            (
               impressions 
               JOIN
                  transactions 
                  ON impressions.MJFINGERPRINT_IMPRESSION = transactions.MJFINGERPRINT_TRANSACTION 
            )
         where
            IMPRESSION_TIME < TRANSACTION_TIME 
         UNION
         SELECT
            APP_ID_IMPRESSION,
            IMPRESSIONS_ID AS MJID_IMPRESSION,
            IMPRESSION_TIME,
            TRANSACTION_USERAGENT,
            USERAGENT,
            SEARCH_REFERRER,
            SEARCH_PAGE_URL,
            APP_ID_TRANSACTION,
            TRANSACTION_ID AS MJID_TRANSACTION,
            TRANSACTION_TIME,
            TRANSACTION_PAGE_URL,
            TR_ORDERID,
            TR_TOTAL,
            MKT_MEDIUM,
            MKT_SOURCE,
            MKT_TERM,
            MKT_CONTENT,
            MKT_CAMPAIGN,
            MKT_CLICKID,
            IMPRESSIONS_EVENTID,
            PAGE_URLHOST,
            MJFINGERPRINT_TRANSACTION,
            MJFINGERPRINT_IMPRESSION,
            USER_IPADDRESS AS IMPRESSION_IP_ADDRESS,
            TRANSACTION_IP_ADDRESS,
            REFR_TERM,
            REFR_MEDIUM,
            REFR_SOURCE 
         FROM
            (
               impressions 
               JOIN
                  transactions 
                  ON impressions.USER_IPADDRESS = transactions.TRANSACTION_IP_ADDRESS
            )
         where
            IMPRESSION_TIME < TRANSACTION_TIME 
            AND TRANSACTION_IP_ADDRESS NOT IN
            (
               SELECT
                  USER_IPADDRESS 
               FROM
                  (
                     SELECT
                        USER_IPADDRESS,
                        COUNT(USER_IPADDRESS) AS IPCOUNT 
                     FROM
                        DATA_COLLECTION_DB.SNOWPLOW.AD_IMPRESSIONS 
                     WHERE
                        COLLECTOR_TSTAMP > CURRENT_DATE() - 30 
                     GROUP BY
                        USER_IPADDRESS 
                     HAVING
                        ipcount > 99
                  )
            )
      )
   ;`
    },
    columns: {
      TR_ORDERID: {},
      TR_TOTAL: {},
      TRANSACTION_TIME: {},
      TRANSACTION_PAGE_URL: {},
      REFR_TERM: {},
      REFR_MEDIUM: {},
      REFR_SOURCE: {},
    }
  }
}
