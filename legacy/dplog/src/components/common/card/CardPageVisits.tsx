"use client";

export default function CardPageVisits() {
  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
      <div className="rounded-t mb-0 px-4 py-3 border-0">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full px-4 max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-base text-blueGray-700">
              Page visits
            </h3>
          </div>
          <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
            <button
              className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded-smoutline-none focus:outline-hiddenmr-1 mb-1 ease-linear transition-all duration-150"
              type="button"
            >
              See all
            </button>
          </div>
        </div>
      </div>
      <div className="block w-full overflow-x-auto">
        <table className="items-center w-full bg-transparent border-collapse">
          <thead>
            <tr>
              <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Page name
              </th>
              <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Visitors
              </th>
              <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Unique users
              </th>
              <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Bounce rate
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                page: "/argon/",
                visitors: 4569,
                users: 340,
                rate: "46.53%",
                trend: "up",
                color: "emerald",
              },
              {
                page: "/argon/index.html",
                visitors: 3985,
                users: 319,
                rate: "46.53%",
                trend: "down",
                color: "orange",
              },
              {
                page: "/argon/charts.html",
                visitors: 3513,
                users: 294,
                rate: "36.49%",
                trend: "down",
                color: "orange",
              },
              {
                page: "/argon/tables.html",
                visitors: 2050,
                users: 147,
                rate: "50.87%",
                trend: "up",
                color: "emerald",
              },
              {
                page: "/argon/profile.html",
                visitors: 1795,
                users: 190,
                rate: "46.53%",
                trend: "down",
                color: "red",
              },
            ].map((row, idx) => (
              <tr key={idx}>
                <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                  {row.page}
                </th>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  {row.visitors.toLocaleString()}
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  {row.users.toLocaleString()}
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  <i
                    className={`fas fa-arrow-${row.trend} text-${row.color}-500 mr-2`}
                  ></i>
                  {row.rate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
