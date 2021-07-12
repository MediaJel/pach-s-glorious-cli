export default class SQL {
  private appId: string

  private limit: number | string

  constructor(appId: string, limit: number | string = 'NULL') {
    this.appId = appId
    this.limit = limit
  }

  public pageview() {
    const sql = `SELECT event:APP_ID, event:COLLECTOR_TSTAMP
      FROM SNOWPLOW.EVENTS
      WHERE event:APP_ID = '${this.appId}' AND event:EVENT='page_view'
      ORDER BY event:COLLECTOR_TSTAMP DESC LIMIT ${this.limit}`

    return sql
  }

  public transaction() {
    const sql = `
      SELECT APP_ID,
      COLLECTOR_TSTAMP,
      TR_TOTAL,
      TR_ORDERID
      FROM DATA_COLLECTION_DB.SNOWPLOW.COMMERCE_TRANSACTIONS
      WHERE APP_ID='${this.appId}' 
      ORDER BY COLLECTOR_TSTAMP DESC
      LIMIT ${this.limit}`

    return sql
  }
}