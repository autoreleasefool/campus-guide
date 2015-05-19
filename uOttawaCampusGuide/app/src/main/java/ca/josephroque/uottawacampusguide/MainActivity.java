package ca.josephroque.uottawacampusguide;

import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.view.MenuItem;

import ca.josephroque.uottawacampusguide.fragment.main.MainMenuFragment;

/**
 * Created by Joseph Roque on 15-05-09
 * <p/>
 * Handles most of the app interaction and UI
 */
public class MainActivity extends ActionBarActivity
        implements MainMenuFragment.MainMenuCallbacks
{

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }

    @Override
    protected void onResume()
    {
        super.onResume();
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item)
    {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings)
        {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
